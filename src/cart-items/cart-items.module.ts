import { Module } from '@nestjs/common';

import { CartItemsService } from './cart-items.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartItemsController } from './cart-items.controller';

@Module({
  controllers: [CartItemsController],
  providers: [CartItemsService, PrismaService],
  exports: [CartItemsService],
})
export class CartItemsModule {}
