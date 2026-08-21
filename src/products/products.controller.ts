import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';

import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { extname } from 'path';
import type { Express } from 'express';
import 'multer';
import { ProductsService } from './products.service';
import { CreateProductDto } from '../dto/product.dto';
import { Product } from './product.schemas';
import { UpdateProductDto } from '../dto/update.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

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
    constructor(private readonly productsService: ProductsService) {}

    @Post()
        @UseInterceptors(productImageUpload)
        async createProduct(
            @Body() createProductDto: CreateProductDto,
            @UploadedFiles() images: Express.Multer.File[] = [],
        ): Promise<Product> {
                if (images.length === 0) {
                    throw new BadRequestException(
                        'At least one image must be uploaded using the images field',
                    );
                }

                const imagePaths = images.map(
                    (file) => `/uploads/products/${file.filename}`,
                );
        return this.productsService.createProduct({ ...createProductDto, images: imagePaths });
    }

    @Get()
    async getAllProducts(): Promise<Product[]>{
        return this.productsService.getAllProducts();
    }

    @Get(':id')
    async getProductById(@Param('id') id: string): Promise<Product | null> {
        return this.productsService.getProductById(id);
    }

    @Put(':id')
    @UseInterceptors(productImageUpload)
    async updateProduct(
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
        @UploadedFiles() images: Express.Multer.File[] = [],
    ): Promise<Product | null> {
        const updateData = images.length > 0
            ? {
                ...updateProductDto,
                images: images.map(
                    (file) => `/uploads/products/${file.filename}`,
                ),
            }
            : updateProductDto;

        return this.productsService.updateProduct(id, updateData);
    }

    @Delete(':id')
    async deleteProduct(@Param('id') id: string): Promise<Product | null> {
        return this.productsService.deleteProduct(id);
    }
}
