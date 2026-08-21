import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '../users/schemas/user.schemas';
import { Role, RoleSchema } from '../role/schema/role.schemas';

import { SeedService } from './seed.service';

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
  ],

  providers: [SeedService],
})
export class SeedModule {}