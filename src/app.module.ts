import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { RoleModule } from './role/role.module';
import { SeedModule } from './seed/seed.module';
import { ProductsModule } from './products/products.module';


@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017/api'), UsersModule, RoleModule, SeedModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
