import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { StripeService } from 'src/stripe/stripe.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserId } from 'src/user-id/user-id.decorator';

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly stripeService: StripeService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async checkout(@UserId() userId: string) {
    return await this.stripeService.createCheckoutSession(userId);
  }

  @Get()
  async handleCheckoutResult(
    @Query('success') success: string,
    @Query('canceled') canceled: string,
  ) {
    if (success === 'true') {
      return { message: 'Checkout successful!' };
    } else if (canceled === 'true') {
      return { message: 'Checkout canceled.' };
    } else {
      throw new BadRequestException('Invalid query parameters');
    }
  }
}
