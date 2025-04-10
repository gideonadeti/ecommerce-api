import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
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

interface AuthPayload {
  email: string;
  sub: string;
  jti: string;
}

const REFRESH_COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokensService: RefreshTokensService,
  ) {}

  private async handleSuccessfulAuth(
    user: Partial<User>,
    res: Response,
    statusCode: number = 200,
  ) {
    const payload = this.createAuthPayload(user);
    const accessToken = this.getAccessToken(payload);
    const refreshToken = this.getRefreshToken(payload);

    try {
      const existingRefreshToken = await this.refreshTokensService.findByUserId(
        user.id,
      );

      if (existingRefreshToken) {
        await this.refreshTokensService.updateByUserId(user.id, refreshToken);
      } else {
        await this.refreshTokensService.create({
          userId: user.id,
          token: refreshToken,
        });
      }

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_CONFIG);
      res.status(statusCode).json({ accessToken, user });
    } catch (error) {
      throw error;
    }
  }

  private handleAuthError(message: string, error: any) {
    console.error(message, error);

    if (error instanceof UnauthorizedException) {
      throw error;
    } else if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Email is already in use.');
    }

    throw new InternalServerErrorException(message);
  }

  private createAuthPayload(user: Partial<User>) {
    return { email: user.email, sub: user.id, jti: uuidv4() };
  }

  private getAccessToken(payload: AuthPayload): string {
    return this.jwtService.sign(payload);
  }

  private getRefreshToken(payload: AuthPayload): string {
    return this.jwtService.sign(payload, {
      secret: jwtConstants.refreshSecret,
      expiresIn: '7d',
    });
  }

  async signUp(createUserDto: CreateUserDto, res: Response): Promise<void> {
    try {
      const user = await this.usersService.create(createUserDto);

      await this.handleSuccessfulAuth(user, res, 201);
    } catch (error) {
      this.handleAuthError('Failed to sign up user.', error);
    }
  }

  async signIn(user: Partial<User>, res: Response): Promise<void> {
    try {
      await this.handleSuccessfulAuth(user, res);
    } catch (error) {
      this.handleAuthError('Failed to sign in user.', error);
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const user = req.user as Partial<User>;
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

      const payload = this.createAuthPayload(user);
      const accessToken = this.getAccessToken(payload);

      res.json({ accessToken });
    } catch (error) {
      this.handleAuthError('Failed to refresh token', error);
    }
  }

  async signOut(user: Partial<User>, res: Response): Promise<void> {
    try {
      await this.refreshTokensService.removeByUserId(user.id);

      res.clearCookie('refreshToken', REFRESH_COOKIE_CONFIG);
      res.sendStatus(200);
    } catch (error) {
      this.handleAuthError('Failed to sign out user.', error);
    }
  }

  async validateUser(email: string, pass: string) {
    try {
      const user = await this.usersService.findByEmail(email);

      if (!user) return null;

      const isCorrectPassword = await bcrypt.compare(pass, user.password);

      if (!isCorrectPassword) return null;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;

      return result;
    } catch (error) {
      throw error;
    }
  }
}
