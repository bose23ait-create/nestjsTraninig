import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { User, UserSchema } from './schemas/user.schemas';
import { Role, RoleSchema } from '../role/schema/role.schemas';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AUTH_CONFIG } from '../constants/users.constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Role.name,
        schema: RoleSchema,
      },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || AUTH_CONFIG.fallbackSecret,
      signOptions: { expiresIn: AUTH_CONFIG.tokenExpiry },
    }),
  ],

  providers: [UsersService],

  controllers: [UsersController],
})
export class UsersModule {}