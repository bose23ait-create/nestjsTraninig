import { Injectable } from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schemas';
import { CreateProductDto } from '../dto/product.dto';
import { UpdateProductDto } from '../dto/update.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

    async createProduct(createProductDto: CreateProductDto): Promise<Product> {
                const createdProduct = new this.productModel({
                    ...createProductDto,
                    images: createProductDto.images ?? [],
                });
        return createdProduct.save();
    }

    async getAllProducts(): Promise<Product[]>{
        const products = await this.productModel.find().exec();
        return products;
    }

    async getProductById(id: string): Promise<Product | null> {
        const product = await this.productModel.findById(id).exec();
        return product;
    }

    async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<Product | null>{
        const updatedProduct = await this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
        return updatedProduct;
    }

    async deleteProduct(id: string): Promise<Product | null>{
        const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();
        return deletedProduct;
    }

    


}
