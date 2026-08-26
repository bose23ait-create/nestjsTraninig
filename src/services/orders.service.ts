import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrderDto } from '../dto/order.dto';
import { Order, OrderDocument } from '../schemas/order.schemas';
import { Product, ProductDocument } from '../schemas/product.schemas';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { StripeService } from '../modules/stripe/stripe.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectQueue('email') private readonly emailQueue: Queue,
    private readonly stripeService: StripeService,
  ) {}

  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<{ order: Order; checkoutUrl: string | null }> {
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
          .findOne({ _id: productId, stock: { $gte: quantity } })
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
      const session = await this.stripeService.createCheckoutSession(
        userId,
        items,
        createOrderDto.customerDetails,
        total,
      );

      // Return a dummy order object to satisfy frontend, but it's not saved to DB
      const dummyOrder = { _id: 'pending' } as unknown as Order;
      return { order: dummyOrder, checkoutUrl: session.url };
    } catch (error) {
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
    status: 'pending' | 'processing' | 'shipped' | 'completed',
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

  async verifyPayment(sessionId: string): Promise<Order | null> {
    try {
      const session =
        await this.stripeService.stripe.checkout.sessions.retrieve(sessionId);

      // If it's already linked to an order, return it
      if (
        session &&
        session.payment_status === 'paid' &&
        session.client_reference_id
      ) {
        const existingOrder = await this.orderModel
          .findById(session.client_reference_id)
          .exec();
        return existingOrder;
      }

      // If it's paid but not linked, create the order from metadata!
      if (session && session.payment_status === 'paid' && session.metadata) {
        // Reassemble metadata
        let metadataStr = '';
        let i = 0;
        while (session.metadata[`chunk_${i}`]) {
          metadataStr += session.metadata[`chunk_${i}`];
          i++;
        }

        if (metadataStr) {
          interface OrderMetadata {
            userId: string;
            items: Array<{
              productId: string;
              quantity: number;
              price: number;
              name: string;
              images: string[];
            }>;
            customerDetails: Record<string, string>;
            total: number;
          }
          const orderData = JSON.parse(metadataStr) as OrderMetadata;

          // Check if we already created an order for this session ID
          const existing = await this.orderModel
            .findOne({ stripeSessionId: sessionId })
            .exec();
          if (existing) return existing;

          // Deduct stock for all items
          for (const item of orderData.items) {
            await this.productModel
              .updateOne(
                { _id: item.productId },
                { $inc: { stock: -item.quantity } },
              )
              .exec();
          }

          // Create the order
          const order = await this.orderModel.create({
            userId: new Types.ObjectId(orderData.userId),
            items: orderData.items,
            customerDetails: orderData.customerDetails,
            total: orderData.total,
            status: 'pending',
            paymentStatus: 'paid',
            stripeSessionId: sessionId,
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
        }
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
    return null;
  }

  async handlePaymentSuccess(
    orderId: string,
    sessionId: string,
  ): Promise<void> {
    await this.verifyPayment(sessionId);
  }
}
