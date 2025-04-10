import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CartItemsService {
  constructor(private readonly prismaService: PrismaService) {}

  private handleError(error: any, action: string) {
    console.error(`Failed to ${action}:`, error);

    if (error instanceof NotFoundException) {
      throw error;
    } else if (error instanceof BadRequestException) {
      throw error;
    } else if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Product is already in cart');
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  async create(createCartItemDto: CreateCartItemDto & { userId: string }) {
    try {
      const product = await this.prismaService.product.findUnique({
        where: { id: createCartItemDto.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${createCartItemDto.productId} not found`,
        );
      }

      if (product.quantity < createCartItemDto.quantity) {
        throw new BadRequestException(
          `Product with ID ${createCartItemDto.productId} has insufficient quantity`,
        );
      }

      return await this.prismaService.cartItem.create({
        data: createCartItemDto,
        include: { product: true },
      });
    } catch (error) {
      this.handleError(error, 'create cart item');
    }
  }

  async findAll(userId: string) {
    try {
      return await this.prismaService.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });
    } catch (error) {
      this.handleError(error, `fetch cart items with user ID ${userId}`);
    }
  }

  async findOne(id: string) {
    try {
      const cartItem = await this.prismaService.cartItem.findUnique({
        where: { id },
        include: { product: true },
      });

      if (!cartItem) {
        throw new NotFoundException(`Cart item with ID ${id} not found`);
      }

      return cartItem;
    } catch (error) {
      this.handleError(error, `fetch cart item with ID ${id}`);
    }
  }

  async update(
    id: string,
    updateCartItemDto: UpdateCartItemDto & { userId: string },
  ) {
    try {
      return await this.prismaService.cartItem.update({
        where: { id },
        data: updateCartItemDto,
        include: { product: true },
      });
    } catch (error) {
      this.handleError(error, `update cart item with ID ${id}`);
    }
  }

  remove(id: string) {
    try {
      return this.prismaService.cartItem.delete({ where: { id } });
    } catch (error) {
      this.handleError(error, `delete cart item with ID ${id}`);
    }
  }
}
