import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrderDto } from '../dto/order.dto';
import { Order, OrderDocument } from '../schemas/order.schemas';
import { Product, ProductDocument } from '../schemas/product.schemas';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    if (!createOrderDto.items?.length) {
      throw new BadRequestException('At least one product is required');
    }

    const quantities = new Map<string, number>();
    for (const item of createOrderDto.items) {
      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity,
      );
    }

    const reserved: ProductDocument[] = [];
    try {
      for (const [productId, quantity] of quantities) {
        const product = await this.productModel
          .findOneAndUpdate(
            { _id: productId, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true },
          )
          .exec();
        if (!product) {
          throw new BadRequestException(
            'One or more products are out of stock',
          );
        }
        reserved.push(product);
      }

      const items = reserved.map((product) => {
        const quantity = quantities.get(product._id.toString())!;
        return {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity,
          images: product.images,
        };
      });
      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const order = await this.orderModel.create({
        userId: new Types.ObjectId(userId),
        items,
        customerDetails: createOrderDto.customerDetails,
        total,
        status: 'pending',
      });

      await this.emailQueue.add('send-email', {
        to: order.customerDetails.email,
        name: order.customerDetails.name,
        type: 'order-created',
        order: {
          orderId: order._id.toString(),
          total: order.total,
          status: order.status,
          customerDetails: order.customerDetails,
          items: order.items,
        },
      });

      return order;
    } catch (error) {
      if (reserved.length) {
        try {
          await Promise.all(
            reserved.map((product) =>
              this.productModel
                .updateOne(
                  { _id: product._id },
                  { $inc: { stock: quantities.get(product._id.toString()) } },
                )
                .exec(),
            ),
          );
        } catch {
          throw new InternalServerErrorException(
            'Order failed and stock rollback could not be completed',
          );
        }
      }
      throw error;
    }
  }

  findUserOrders(userId: string): Promise<Order[]> {
    const userObjectId = Types.ObjectId.isValid(userId)
      ? new Types.ObjectId(userId)
      : userId;

    return this.orderModel
      .find({
        $or: [{ userId: userObjectId }, { userId }],
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  findAllOrders(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).lean().exec();
  }

  async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'processing' | 'shipped' | 'completed' ,
  ): Promise<Order | null> {
    const order = await this.orderModel
      .findByIdAndUpdate(orderId, { status }, { new: true })
      .lean()
      .exec();

    if (order) {
      await this.emailQueue.add('send-email', {
        to: order.customerDetails.email,
        name: order.customerDetails.name,
        type: 'order-status',
        order: {
          orderId: order._id.toString(),
          total: order.total,
          status: order.status,
          customerDetails: order.customerDetails,
          items: order.items,
        },
      });
    }

    return order;
  }
}
