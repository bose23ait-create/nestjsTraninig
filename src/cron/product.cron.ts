import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Product, ProductDocument } from '../schemas/product.schemas';

@Injectable()
export class ProductCronService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  //mon-fri at 11:30 am
  // seconds minutes hours day-of-month month day-of-week

  @Cron('0 30 11 * * 1-5',{
    name:'update Stock',
    timeZone:'Asia/Kolkata',
    disabled:true,
    waitForCompletion:true
  })
  async updateProductQuantity() {
    try {
      const result = await this.productModel.updateMany(
        {},
        {
          $inc: {
            stock: 5,
          },
        },
      );

      console.log(
        `Product quantity updated. ${result.modifiedCount} products increased by 5.`,
      );
    } catch (error) {
      console.error('Error updating product quantity:', error);
    }
  }
}

