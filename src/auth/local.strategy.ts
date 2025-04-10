import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    try {
      const user = await this.authService.validateUser(email, password);

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      return user;
    } catch (error) {
      console.error('Failed to validate user:', error);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to validate user.');
    }
  }
}
