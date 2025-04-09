import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { jwtConstants } from './constants';
import { RefreshTokensService } from 'src/refresh-tokens/refresh-tokens.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokensService: RefreshTokensService,
  ) {}

  async signUp(createUserDto: CreateUserDto, res: Response) {
    const user = await this.usersService.create(createUserDto);
    const payload = { email: user.email, sub: user.id };
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
  }

  async signIn(user: any, res: Response) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.getAccessToken(payload);
    const refreshToken = this.getRefreshToken(payload);

    await this.refreshTokensService.updateByUserId(user.id, refreshToken);

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
  }

  async refresh(user: any, res: Response) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.getAccessToken(payload);
    const refreshToken = this.getRefreshToken(payload);

    await this.refreshTokensService.updateByUserId(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
    });
  }

  async signOut(user: any, res: Response) {
    await this.refreshTokensService.removeByUserId(user.id);

    res.clearCookie('refreshToken');
    res.sendStatus(200);
  }

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) return null;

    const { password, ...result } = user;

    const isCorrectPassword = await bcrypt.compare(pass, password);

    if (!isCorrectPassword) return null;

    return result;
  }

  getAccessToken(payload: { sub: string; email: string }) {
    return this.jwtService.sign(payload);
  }

  getRefreshToken(payload: { sub: string; email: string }) {
    return this.jwtService.sign(payload, {
      secret: jwtConstants.refreshSecret,
      expiresIn: '7d',
    });
  }
}
