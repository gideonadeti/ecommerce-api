import * as bcrypt from 'bcryptjs';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RefreshTokensService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createRefreshTokenDto: CreateRefreshTokenDto) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedToken = await bcrypt.hash(createRefreshTokenDto.token, salt);

      await this.prismaService.refreshToken.create({
        data: { ...createRefreshTokenDto, token: hashedToken },
      });
    } catch (error) {
      console.error('Failed to create refresh token:', error);

      throw new InternalServerErrorException('Failed to create refresh token');
    }
  }

  async updateByUserId(userId: string, newToken: string) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedToken = await bcrypt.hash(newToken, salt);

      await this.prismaService.refreshToken.update({
        where: { userId },
        data: { token: hashedToken },
      });
    } catch (error) {
      console.error('Failed to update refresh token:', error);

      throw new InternalServerErrorException('Failed to update refresh token');
    }
  }

  async removeByUserId(userId: string) {
    try {
      await this.prismaService.refreshToken.delete({ where: { userId } });
    } catch (error) {
      console.error('Failed to delete refresh token:', error);

      throw new InternalServerErrorException('Failed to delete refresh token');
    }
  }
}
