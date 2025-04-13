import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { StripeService } from 'src/stripe/stripe.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserId } from 'src/user-id/user-id.decorator';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly stripeService: StripeService) {}

  @Post()
  async checkout(@UserId() userId: string) {
    return await this.stripeService.createCheckoutSession(userId);
  }
}
