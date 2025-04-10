import { Module } from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RefreshTokensModule } from './refresh-tokens/refresh-tokens.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [UsersModule, AuthModule, RefreshTokensModule, ProductsModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
