import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Product, ProductSchema } from '../schemas/product.schemas';
import { ProductsService } from '../services/products.service';
import { ProductsController } from '../controllers/products.controller';
import { AUTH_CONFIG } from '../constants/users.constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ProductCronService } from '../cron/product.cron';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || AUTH_CONFIG.fallbackSecret,
    }),
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
  ],
  providers: [ProductsService, JwtAuthGuard, RolesGuard, ProductCronService],
  controllers: [ProductsController],
})
export class ProductsModule {}
