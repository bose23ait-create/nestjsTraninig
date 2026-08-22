import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User, UserSchema } from '../schemas/user.schemas';
import { Role, RoleSchema } from '../schemas/role.schemas';

import { UsersService } from '../services/users.service';
import { UsersController } from '../controllers/users.controller';
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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || AUTH_CONFIG.fallbackSecret,
        signOptions: { expiresIn: AUTH_CONFIG.tokenExpiry },
      }),
    }),
  ],

  providers: [UsersService],

  controllers: [UsersController],
})
export class UsersModule {}