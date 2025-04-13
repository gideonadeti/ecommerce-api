import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StripeModule } from './stripe/stripe.module';
import { RefreshTokensModule } from './refresh-tokens/refresh-tokens.module';
import { ProductsModule } from './products/products.module';
import { CartItemsModule } from './cart-items/cart-items.module';
import { PrismaService } from './prisma/prisma.service';
import { CheckoutController } from './checkout/checkout.controller';
import { WebhooksController } from './webhooks/webhooks.controller';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    RefreshTokensModule,
    ProductsModule,
    CartItemsModule,
    StripeModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [CheckoutController, WebhooksController],
  providers: [PrismaService],
})
export class AppModule {}
