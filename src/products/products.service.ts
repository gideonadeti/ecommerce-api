import { Prisma } from '@prisma/client';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllProductsDto } from './dto/find-all-products.dto';

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

  async findAll(query: FindAllProductsDto) {
    try {
      const {
        name,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        order = 'desc',
        limit,
        page,
      } = query;

      const whereConditions: any = {};

      if (name) {
        whereConditions.name = { contains: name, mode: 'insensitive' };
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        whereConditions.price = {};

        if (minPrice !== undefined) {
          whereConditions.price.gte = this.roundPrice(minPrice);
        }
        if (maxPrice !== undefined) {
          whereConditions.price.lte = this.roundPrice(maxPrice);
        }
      }

      if (!page && !limit) {
        return await this.prismaService.product.findMany({
          where: whereConditions,
          orderBy: {
            [sortBy]: order,
          },
        });
      }

      const numberPage = page ? Number(page) : 1;
      const numberLimit = limit ? Number(limit) : 10;
      const total = await this.prismaService.product.count({
        where: whereConditions,
      });
      const lastPage = Math.ceil(total / numberLimit);
      const products = await this.prismaService.product.findMany({
        where: whereConditions,
        orderBy: {
          [sortBy]: order,
        },
        skip: (numberPage - 1) * numberLimit,
        take: numberLimit,
      });

      return {
        products,
        meta: {
          total,
          page: numberPage,
          lastPage,
          hasNextPage: numberPage < lastPage,
          hasPreviousPage: numberPage > 1,
        },
      };
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
