import Stripe from 'stripe';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { CartItemsService } from 'src/cart-items/cart-items.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  constructor(
    private readonly cartItemsService: CartItemsService,
    private readonly configService: ConfigService,
  ) {}

  public stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  async createCheckoutSession(userId: string) {
    try {
      const cartItems = await this.cartItemsService.findAll(userId);
      const frontendBaseUrl =
        this.configService.get<string>('FRONTEND_BASE_URL');

      if (cartItems.length === 0) {
        throw new BadRequestException(
          'Cart is empty. Cannot proceed to checkout.',
        );
      }

      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: cartItems.map((item) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.product.name,
            },
            unit_amount: Number(item.product.price) * 100,
          },
          quantity: item.quantity,
        })),
        success_url: `${frontendBaseUrl}/checkout?success=true`,
        cancel_url: `${frontendBaseUrl}/checkout?canceled=true`,
      });

      return {
        stripeSessionUrl: session.url,
      };
    } catch (error) {
      console.error('Failed to create checkout session:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to create checkout session.',
      );
    }
  }

  async handleSuccessfulCheckout(session: Stripe.Checkout.Session) {
    console.log('Checkout session completed:', session);
  }
}
