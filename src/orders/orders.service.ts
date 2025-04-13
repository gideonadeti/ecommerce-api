import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService) {}

  private handleError(error: any, action: string) {
    console.error(`Failed to ${action}:`, error);

    if (error instanceof NotFoundException) {
      throw error;
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  async findAll(userId: string) {
    try {
      return await this.prismaService.order.findMany({
        where: { userId, status: 'DELIVERING' },
        include: { orderItems: true },
      });
    } catch (error) {
      this.handleError(error, `fetch orders with user ID ${userId}`);
    }
  }

  async findOne(id: string) {
    try {
      const order = await this.prismaService.order.findUnique({
        where: { id },
        include: { orderItems: true },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      return order;
    } catch (error) {
      this.handleError(error, `fetch order with ID ${id}`);
    }
  }
}
