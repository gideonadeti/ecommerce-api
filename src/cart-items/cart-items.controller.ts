import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';

import { CartItemsService } from './cart-items.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('cart-items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart-items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post()
  create(
    @Req() req: Request & { user: { id: string } },
    @Body() createCartItemDto: CreateCartItemDto,
  ) {
    return this.cartItemsService.create({
      ...createCartItemDto,
      userId: req.user.id,
    });
  }

  @Get()
  findAll(@Req() req: Request & { user: { id: string } }) {
    return this.cartItemsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartItemsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartItemsService.update(id, {
      ...updateCartItemDto,
      userId: req.user.id,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartItemsService.remove(id);
  }
}
