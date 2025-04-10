import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { jwtConstants } from './constants';
import { RefreshTokensService } from 'src/refresh-tokens/refresh-tokens.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokensService: RefreshTokensService,
  ) {}

  async signUp(createUserDto: CreateUserDto, res: Response) {
    try {
      const user = await this.usersService.create(createUserDto);
      const payload = { email: user.email, sub: user.id, jti: uuidv4() };
      const accessToken = this.getAccessToken(payload);
      const refreshToken = this.getRefreshToken(payload);

      await this.refreshTokensService.create({
        userId: user.id,
        token: refreshToken,
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({
        accessToken,
        user: userWithoutPassword,
      });
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

  async signIn(user: any, res: Response) {
    const payload = { email: user.email, sub: user.id, jti: uuidv4() };
    const accessToken = this.getAccessToken(payload);
    const refreshToken = this.getRefreshToken(payload);

    try {
      const existingRefreshToken = await this.refreshTokensService.findByUserId(
        user.id,
      );

      // If the user is already signed in, update their refresh token else create a new one
      if (existingRefreshToken) {
        await this.refreshTokensService.updateByUserId(user.id, refreshToken);
      } else {
        await this.refreshTokensService.create({
          userId: user.id,
          token: refreshToken,
        });
      }

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        accessToken,
        user,
      });
    } catch (error) {
      console.error('Failed to sign in user:', error);

      throw new InternalServerErrorException('Failed to sign in user.');
    }
  }

  async refresh(req: Request, res: Response) {
    const user = req.user as any;
    const refreshTokenFromCookie = req.cookies['refreshToken'];

    try {
      const existingRefreshToken = await this.refreshTokensService.findByUserId(
        user.id,
      );

      if (!existingRefreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isCorrectRefreshToken = await bcrypt.compare(
        refreshTokenFromCookie,
        existingRefreshToken.token,
      );

      if (!isCorrectRefreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload = { email: user.email, sub: user.id, jti: uuidv4() };
      const accessToken = this.getAccessToken(payload);

      res.json({
        accessToken,
      });
    } catch (error) {
      console.error('Failed to refresh token:', error);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to refresh token');
    }
  }

  async signOut(user: any, res: Response) {
    try {
      await this.refreshTokensService.removeByUserId(user.id);

      res.clearCookie('refreshToken', {
        path: '/auth/refresh',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      res.sendStatus(200);
    } catch (error) {
      console.error('Failed to sign out user:', error);

      throw new InternalServerErrorException('Failed to sign out user.');
    }
  }

  async validateUser(email: string, pass: string) {
    try {
      const user = await this.usersService.findByEmail(email);

      if (!user) return null;

      const { password, ...result } = user;

      const isCorrectPassword = await bcrypt.compare(pass, password);

      if (!isCorrectPassword) return null;

      return result;
    } catch (error) {
      throw error;
    }
  }

  getAccessToken(payload: { sub: string; email: string; jti: string }) {
    return this.jwtService.sign(payload);
  }

  getRefreshToken(payload: { sub: string; email: string; jti: string }) {
    return this.jwtService.sign(payload, {
      secret: jwtConstants.refreshSecret,
      expiresIn: '7d',
    });
  }
}
