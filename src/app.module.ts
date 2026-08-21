import { MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users.module';
import { RoleModule } from './modules/role.module';
import { SeedModule } from './seed/seed.module';
import { ProductsModule } from './modules/products.module';

import {LoggerMiddleware} from './common/middleware/logger.middleware';


@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017/api'), UsersModule, RoleModule, SeedModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
