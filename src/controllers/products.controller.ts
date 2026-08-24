import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Query,
} from '@nestjs/common';

import { ProductFilterDto } from '../dto/filter.dto';

import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { extname } from 'path';
import 'multer';
import { ProductsService, ProductListResponse } from '../services/products.service';
import { CreateProductDto } from '../dto/product.dto';
import { Product } from '../schemas/product.schemas';
import { UpdateProductDto } from '../dto/update.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ADMIN_ROLE } from '../constants/users.constants';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

const productImageUpload = FilesInterceptor('images', 5, {
  storage: diskStorage({
    destination: (_request, _file, callback) => {
      const uploadDirectory = './uploads/products';
      mkdirSync(uploadDirectory, { recursive: true });
      callback(null, uploadDirectory);
    },
    filename: (_request, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_request, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
      callback(null, true);
      return;
    }

    callback(new Error('Only image files are allowed'), false);
  },
});

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLE)
  @UseInterceptors(productImageUpload)
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[] = [],
    @Req() request: AuthenticatedRequest,
  ): Promise<Product> {
    try {
      if (images.length === 0) {
        throw new BadRequestException(
          'At least one image must be uploaded using the images field',
        );
      }

      const imagePaths = images.map(
        (file) => `/uploads/products/${file.filename}`,
      );
      const product = await this.productsService.createProduct({
        ...createProductDto,
        images: imagePaths,
      });

      await this.emailQueue.add(
        'send-email',
        {
          to: request.user?.email,
          name: request.user?.email,
          product: {
            name: createProductDto.name,
            description: createProductDto.description,
            price: createProductDto.price,
            stock: createProductDto.stock,
            images: imagePaths,
          },
        },
        {
          attempts: 3,
          backoff: {
            delay: 10000,
            type: 'fixed',
          },
          priority: 1,
        },
      );

      return product;
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllProducts(
    @Query() filterDto: ProductFilterDto,
  ): Promise<ProductListResponse> {
    try {
      return this.productsService.getAllProducts(filterDto);
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getProductById(@Param('id') id: string): Promise<Product | null> {
    try {
      return this.productsService.getProductById(id);
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLE)
  @UseInterceptors(productImageUpload)
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images: Express.Multer.File[] = [],
  ): Promise<Product | null> {
    try {
      const { existingImages, ...productFields } = updateProductDto as UpdateProductDto & {
        existingImages?: string[] | string;
      };
      const retainedImages = existingImages
        ? (Array.isArray(existingImages) ? existingImages : [existingImages]).filter(Boolean)
        : [];
      const updateData =
        images.length > 0 || existingImages !== undefined
          ? {
              ...productFields,
              images: images.map(
                (file) => `/uploads/products/${file.filename}`,
              ).concat(retainedImages),
            }
          : productFields;

      return this.productsService.updateProduct(id, updateData);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLE)
  async deleteProduct(@Param('id') id: string): Promise<Product | null> {
    try {
      return this.productsService.deleteProduct(id);
    } catch (error) {
      throw error;
    }
  }
}
