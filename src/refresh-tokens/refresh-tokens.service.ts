import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';

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
      throw error;
    }
  }

  async findByUserId(userId: string) {
    try {
      const refreshToken = await this.prismaService.refreshToken.findUnique({
        where: { userId },
      });

      return refreshToken;
    } catch (error) {
      throw error;
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
      throw error;
    }
  }

  async removeByUserId(userId: string) {
    try {
      await this.prismaService.refreshToken.delete({ where: { userId } });
    } catch (error) {
      throw error;
    }
  }
}
