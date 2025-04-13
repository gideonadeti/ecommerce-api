import { Module } from '@nestjs/common';

import { CartItemsModule } from 'src/cart-items/cart-items.module';
import { StripeService } from './stripe.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [CartItemsModule],
  providers: [StripeService, PrismaService],
  exports: [StripeService],
})
export class StripeModule {}
