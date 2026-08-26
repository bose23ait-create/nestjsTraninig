import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from '../controllers/orders.controller';
import { OrdersService } from '../services/orders.service';
import { Order, OrderSchema } from '../schemas/order.schemas';
import { Product, ProductSchema } from '../schemas/product.schemas';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AUTH_CONFIG } from '../constants/users.constants';

import { BullModule } from '@nestjs/bullmq';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'email' }),
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || AUTH_CONFIG.fallbackSecret,
      }),
    }),
    forwardRef(() => StripeModule),
  ],
  providers: [OrdersService, JwtAuthGuard, RolesGuard],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
