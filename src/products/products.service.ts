import { Prisma } from '@prisma/client';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  private handleError(error: any, action: string) {
    console.error(`Failed to ${action}:`, error);

    if (error instanceof NotFoundException) {
      throw error;
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  async create(createProductDto: CreateProductDto) {
    try {
      const roundedPrice = new Prisma.Decimal(createProductDto.price).toFixed(
        2,
      );
      return await this.prismaService.product.create({
        data: { ...createProductDto, price: roundedPrice },
      });
    } catch (error) {
      this.handleError(error, 'create product');
    }
  }

  async findAll() {
    try {
      return await this.prismaService.product.findMany();
    } catch (error) {
      this.handleError(error, 'fetch products');
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.prismaService.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      this.handleError(error, `fetch product with ID ${id}`);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      return await this.prismaService.product.update({
        where: { id },
        data: updateProductDto,
      });
    } catch (error) {
      this.handleError(error, `update product with ID ${id}`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prismaService.product.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError(error, `delete product with ID ${id}`);
    }
  }
}
