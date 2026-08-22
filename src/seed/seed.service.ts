import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from '../schemas/user.schemas';
import { Role, RoleDocument } from '../schemas/role.schemas';

import { userSeed } from './user.seed';
import { roleSeed } from './role.seed';

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
      const users = await Promise.all(
        userSeed.map(async (seedUser) => {
          const role = await this.roleModel.findOne({ name: seedUser.role });

          if (!role) {
            throw new Error(`Role not found: ${seedUser.role}`);
          }

          return {
            ...seedUser,
            password: await bcrypt.hash(seedUser.password, 10),
            role: role._id,
          };
        }),
      );

      await this.userModel.insertMany(users);
      console.log('User seed inserted successfully');
    } else {
      console.log('Users already exist');
    }
  }
}
