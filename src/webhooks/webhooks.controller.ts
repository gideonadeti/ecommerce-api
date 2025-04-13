import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Headers,
  InternalServerErrorException,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';

import { StripeService } from 'src/stripe/stripe.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    try {
      const webhookSecret = this.configService.get<string>(
        'STRIPE_WEBHOOK_SIGNING_SECRET',
      );

      const event = this.stripeService.stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        webhookSecret,
      );

      console.log(`Stripe event received: ${event.type}`);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        this.stripeService.handleSuccessfulCheckout(session).catch((error) => {
          console.error('Failed to handle successful checkout:', error);
        });
      }

      return { received: true };
    } catch (error) {
      console.error('Failed to handle Stripe webhook:', error);

      throw new InternalServerErrorException('Failed to handle Stripe webhook');
    }
  }
}
