import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schemas';
import { CreateProductDto } from '../dto/product.dto';
import { UpdateProductDto } from '../dto/update.dto';

import { ProductFilterDto } from '../dto/filter.dto';

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: {
    all: number;
    available: number;
    soldOut: number;
  };
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const createdProduct = new this.productModel({
        ...createProductDto,
        images: createProductDto.images ?? [],
      });
      return createdProduct.save();
    } catch (error) {
      throw error;
    }
  }

  async getAllProducts(
    filterDto: ProductFilterDto,
  ): Promise<ProductListResponse> {
    try {
      const filter: Record<string, any> = {};

      if (filterDto.name) {
        filter.name = { $regex: filterDto.name, $options: 'i' };
      }

      if (filterDto.createdDate) {
        const startDate = new Date(filterDto.createdDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        filter.createdAt = { $gte: startDate, $lt: endDate };
      }

      if (filterDto.stockAvailable !== undefined) {
        if (filterDto.stockAvailable === 'true') {
          filter.stock = { $gt: 0 };
        } else {
          filter.stock = { $eq: 0 };
        }
      }

      const page = filterDto.page ?? 1;
      const limit = filterDto.limit ?? 8;
      const sortBy = filterDto.sortBy ?? 'name';
      const total = await this.productModel.countDocuments(filter).exec();
      const items = await this.productModel
        .find(filter)
        .sort({ [sortBy]: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      const [all, available, soldOut] = await Promise.all([
        this.productModel.countDocuments({}).exec(),
        this.productModel.countDocuments({ stock: { $gt: 0 } }).exec(),
        this.productModel.countDocuments({ stock: { $eq: 0 } }).exec(),
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        counts: { all, available, soldOut },
      };
    } catch (error) {
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const product = await this.productModel.findById(id).exec();
      return product;
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product | null> {
    try {
      const updatedProduct = await this.productModel
        .findByIdAndUpdate(id, updateProductDto, { new: true })
        .exec();
      return updatedProduct;
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<Product | null> {
    try {
      const deletedProduct = await this.productModel
        .findByIdAndDelete(id)
        .exec();
      return deletedProduct;
    } catch (error) {
      throw error;
    }
  }
}
