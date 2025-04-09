import { Injectable } from '@nestjs/common';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies['refreshToken'],
      ]),
      secretOrKey: jwtConstants.refreshSecret,
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email };
  }
}
