import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
      const user = await this.prismaService.user.create({
        data: { ...createUserDto, password: hashedPassword },
      });

      return user;
    } catch (error) {
      console.error('Failed to create user:', error);

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email is already in use.');
      }

      throw new InternalServerErrorException('Failed to create user.');
    }
  }

  async findAll() {
    try {
      const users = await this.prismaService.user.findMany();

      return users;
    } catch (error) {
      console.error('Failed to fetch users:', error);

      throw new InternalServerErrorException('Failed to fetch users.');
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prismaService.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error) {
      console.error(`Failed to fetch user with ID ${id}:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch user.');
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException(`User with email ${email} not found.`);
      }

      return user;
    } catch (error) {
      console.error(`Failed to fetch user with email ${email}:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch user.');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      if (updateUserDto.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(updateUserDto.password, salt);

        updateUserDto.password = hashedPassword;
      }

      const user = await this.prismaService.user.update({
        where: { id },
        data: updateUserDto,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error) {
      console.error(`Failed to update user with ID ${id}:`, error);

      throw new InternalServerErrorException('Failed to update user.');
    }
  }

  async remove(id: string) {
    try {
      const user = await this.prismaService.user.delete({
        where: { id },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error) {
      console.error(`Failed to delete user with ID ${id}:`, error);

      throw new InternalServerErrorException('Failed to delete user.');
    }
  }
}
