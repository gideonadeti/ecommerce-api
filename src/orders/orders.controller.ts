import { Controller, Get, Param } from '@nestjs/common';

import { OrdersService } from './orders.service';
import { UserId } from 'src/user-id/user-id.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@UserId() userId: string) {
    return this.ordersService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}
