import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { CartItemsService } from 'src/cart-items/cart-items.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StripeService {
  constructor(
    private readonly cartItemsService: CartItemsService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  private handleError(error: any, action: string) {
    console.error(`Failed to ${action}:`, error);

    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  public stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  async createCheckoutSession(userId: string) {
    try {
      const cartItems = await this.cartItemsService.findAll(userId);
      const backendBaseUrl = this.configService.get<string>('BACKEND_BASE_URL');

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
        metadata: {
          userId,
        },
        success_url: `${backendBaseUrl}/checkout?success=true`,
        cancel_url: `${backendBaseUrl}/checkout?canceled=true`,
      });

      return {
        stripeSessionUrl: session.url,
      };
    } catch (error) {
      this.handleError(error, 'create checkout session');
    }
  }

  async handleSuccessfulCheckout(session: Stripe.Checkout.Session) {
    const userId = session.metadata.userId;

    try {
      const cartItems = await this.cartItemsService.findAll(userId);
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.product.price),
      }));

      await this.prismaService.$transaction([
        ...cartItems.map((item) =>
          this.prismaService.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          }),
        ),
        this.prismaService.order.create({
          data: {
            userId,
            total: session.amount_total / 100,
            orderItems: {
              createMany: {
                data: orderItems,
              },
            },
          },
        }),
        this.prismaService.cartItem.deleteMany({ where: { userId } }),
      ]);
    } catch (error) {
      this.handleError(error, 'handle successful checkout');
    }
  }
}
