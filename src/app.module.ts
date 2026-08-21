import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsModule } from './students/students.module';
import { UsersModule } from './users/users.module';
import { RoleModule } from './role/role.module';
import { SeedModule } from './seed/seed.module';


@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017/api'), StudentsModule, UsersModule, RoleModule, SeedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
