import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RefreshTokenGuard } from './refresh-token.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    return this.authService.signUp(createUserDto, res);
  }

  @ApiBody({ type: SignInDto })
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async signIn(@Req() req: Request, @Res() res: Response) {
    return this.authService.signIn(req.user, res);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    return this.authService.refresh(req, res);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('sign-out')
  async signOut(@Req() req: Request, @Res() res: Response) {
    return this.authService.signOut(req.user, res);
  }
}
