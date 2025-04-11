import { Prisma } from '@prisma/client';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchProductDto } from './dto/search-product.dto';

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

  private roundPrice(price: number) {
    return new Prisma.Decimal(price).toFixed(2);
  }

  async create(createProductDto: CreateProductDto) {
    try {
      return await this.prismaService.product.create({
        data: {
          ...createProductDto,
          price: this.roundPrice(createProductDto.price),
        },
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

  async search(query: SearchProductDto) {
    try {
      const whereConditions: any = {};

      if (query.name) {
        whereConditions.name = {
          contains: query.name,
          mode: 'insensitive',
        };
      }

      if (query.minPrice || query.maxPrice) {
        whereConditions.price = {};

        if (query.minPrice)
          whereConditions.price.gte = this.roundPrice(query.minPrice);
        if (query.maxPrice)
          whereConditions.price.lte = this.roundPrice(query.maxPrice);
      }

      return await this.prismaService.product.findMany({
        where: whereConditions,
      });
    } catch (error) {
      this.handleError(error, 'search products');
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
