import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { USER_ROUTES } from '../constants/users.constants';

@Controller(USER_ROUTES.base)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post(USER_ROUTES.register)
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.usersService.createUser(registerDto);
    } catch (error) {
      throw error;
    }
  }

  @Post(USER_ROUTES.login)
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.usersService.login(loginDto);
    } catch (error) {
      throw error;
    }
  }
}