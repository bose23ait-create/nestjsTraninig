import { Module } from '@nestjs/common';
import {RoleSchema} from './schema/role.schemas'
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Role', schema: RoleSchema }])
  ]
})
export class RoleModule {}
