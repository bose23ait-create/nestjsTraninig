import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas/user.schemas';
import { Role, RoleDocument } from '../role/schema/role.schemas';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
  ) {}

  async createUser(registerDto: RegisterDto) {

    try {

      const { name, email, password, age } = registerDto;

      // Check existing user
      const existingUser = await this.userModel.findOne({ email });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const userRole = await this.roleModel.findOne({ name: 'user' });

      if (!userRole) {
        throw new NotFoundException('The user role has not been seeded');
      }

      // Create user
      const user = await this.userModel.create({
        name,
        email,
        password,
        age,
        role: userRole._id,
      });

      return user;

    } catch (error) {

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw error;
    }
  }
}