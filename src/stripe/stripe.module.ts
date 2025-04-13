import { Module } from '@nestjs/common';

import { CartItemsModule } from 'src/cart-items/cart-items.module';
import { StripeService } from './stripe.service';

@Module({
  imports: [CartItemsModule],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
