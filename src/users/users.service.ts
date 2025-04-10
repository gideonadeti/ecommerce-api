import * as bcrypt from 'bcryptjs';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(10);

      return bcrypt.hash(password, salt);
    } catch (error) {
      throw error;
    }
  }

  private excludePassword<T extends { password: string }>(user: T) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  private handleError(error: any, action: string) {
    console.error(`Failed to ${action}:`, error);

    if (error instanceof NotFoundException) {
      throw error;
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await this.hashPassword(createUserDto.password);
      const user = await this.prismaService.user.create({
        data: { ...createUserDto, password: hashedPassword },
      });

      return this.excludePassword(user);
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prismaService.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return this.excludePassword(user);
    } catch (error) {
      this.handleError(error, `fetch user with ID ${id}`);
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.prismaService.user.findUnique({
        where: { email },
      });
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      if (updateUserDto.password) {
        updateUserDto.password = await this.hashPassword(
          updateUserDto.password,
        );
      }

      const user = await this.prismaService.user.update({
        where: { id },
        data: updateUserDto,
      });

      return this.excludePassword(user);
    } catch (error) {
      this.handleError(error, `update user with ID ${id}`);
    }
  }

  async remove(id: string) {
    try {
      const user = await this.prismaService.user.delete({
        where: { id },
      });

      return this.excludePassword(user);
    } catch (error) {
      this.handleError(error, `delete user with ID ${id}`);
    }
  }
}
