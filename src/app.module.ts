import { Module } from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RefreshTokensModule } from './refresh-tokens/refresh-tokens.module';

@Module({
  imports: [UsersModule, AuthModule, RefreshTokensModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
