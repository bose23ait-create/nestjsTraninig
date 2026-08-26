import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { CreateOrderDto, UpdateOrderStatusDto, RequestCancellationDto } from '../dto/order.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ADMIN_ROLE } from '../constants/users.constants';
import { OrdersService } from '../services/orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(
    @Body() dto: CreateOrderDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ordersService.createOrder(request.user!.sub, dto);
  }

  @Get('my')
  getMyOrders(@Req() request: AuthenticatedRequest) {
    return this.ordersService.findUserOrders(request.user!.sub);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(ADMIN_ROLE)
  getAllOrders() {
    return this.ordersService.findAllOrders();
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(ADMIN_ROLE)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(id, dto.status);
  }

  @Patch(':id/request-cancellation')
  requestCancellation(
    @Param('id') id: string,
    @Body() dto: RequestCancellationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ordersService.requestCancellation(request.user!.sub, id, dto.reason);
  }

  @Patch(':id/approve-cancellation')
  @UseGuards(RolesGuard)
  @Roles(ADMIN_ROLE)
  approveCancellation(@Param('id') id: string) {
    return this.ordersService.approveCancellation(id);
  }

  @Patch(':id/reject-cancellation')
  @UseGuards(RolesGuard)
  @Roles(ADMIN_ROLE)
  rejectCancellation(@Param('id') id: string) {
    return this.ordersService.rejectCancellation(id);
  }
}
