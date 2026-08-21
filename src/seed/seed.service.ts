import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from '../users/schemas/user.schemas';
import { Role, RoleDocument } from '../role/schema/role.schemas';

import { userSeed } from '../users/seeds/user.seed';
import { roleSeed } from '../role/seeds/role.seed';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,

    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
  ) {}

  async seedRoles() {
    const roleCount = await this.roleModel.countDocuments();

    if (roleCount === 0) {
      await this.roleModel.insertMany(roleSeed);
      console.log('Role seed inserted successfully');
    } else {
      console.log('Roles already exist');
    }
  }

  async seedUsers() {
    const userCount = await this.userModel.countDocuments();

    if (userCount === 0) {
      await this.userModel.insertMany(userSeed);
      console.log('User seed inserted successfully');
    } else {
      console.log('Users already exist');
    }
  }
}