import { Module } from '@nestjs/common';

import { RefreshTokensService } from './refresh-tokens.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [RefreshTokensService, PrismaService],
  exports: [RefreshTokensService],
})
export class RefreshTokensModule {}
