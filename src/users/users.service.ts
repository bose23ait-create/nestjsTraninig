import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from './schemas/user.schemas';
import { Role, RoleDocument } from '../role/schema/role.schemas';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import {
  AUTH_CONFIG,
  USER_MESSAGES,
  USER_ROLE,
} from '../constants/users.constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(registerDto: RegisterDto) {
    try {
      const { name, email, password, age } = registerDto;

      const existingUser = await this.userModel.findOne({ email });

      if (existingUser) {
        throw new ConflictException(USER_MESSAGES.emailAlreadyExists);
      }

      const userRole = await this.roleModel.findOne({ name: USER_ROLE });

      if (!userRole) {
        throw new NotFoundException(USER_MESSAGES.roleNotSeeded);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.userModel.create({
        name,
        email,
        password: hashedPassword,
        age,
        role: userRole._id,
      });

      const { password: _password, ...safeUser } = user.toObject();
      return safeUser;
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

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      const user = await this.userModel.findOne({ email }).select('+password');

      if (!user) {
        throw new UnauthorizedException(USER_MESSAGES.invalidCredentials);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException(USER_MESSAGES.invalidCredentials);
      }

      const role = await this.roleModel.findById(user.role).lean();
      if (!role) {
        throw new UnauthorizedException(USER_MESSAGES.roleNotSeeded);
      }

      const payload = {
        sub: user._id,
        email: user.email,
        role: role.name,
      };

      return {
        [AUTH_CONFIG.accessTokenKey]: this.jwtService.sign(payload),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw error;
    }
  }
}