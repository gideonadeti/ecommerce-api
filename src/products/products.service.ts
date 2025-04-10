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

  private handleError(error: any, message: string) {
    console.error(message, error);

    if (error instanceof NotFoundException) {
      throw error;
    }

    throw new InternalServerErrorException(message);
  }

  async create(createProductDto: CreateProductDto) {
    try {
      const roundedPrice = new Prisma.Decimal(createProductDto.price).toFixed(
        2,
      );
      const product = await this.prismaService.product.create({
        data: { ...createProductDto, price: roundedPrice },
      });

      return product;
    } catch (error) {
      this.handleError(error, 'Failed to create product.');
    }
  }

  async findAll() {
    try {
      const products = await this.prismaService.product.findMany();

      return products;
    } catch (error) {
      this.handleError(error, 'Failed to fetch products');
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.prismaService.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found.`);
      }

      return product;
    } catch (error) {
      this.handleError(error, `Failed to fetch product with ID ${id}`);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.prismaService.product.update({
        where: { id },
        data: updateProductDto,
      });

      return product;
    } catch (error) {
      this.handleError(error, `Failed to update product with ID ${id}`);
    }
  }

  async remove(id: string) {
    try {
      const product = await this.prismaService.product.delete({
        where: { id },
      });

      return product;
    } catch (error) {
      this.handleError(error, `Failed to delete product with ID ${id}`);
    }
  }
}
