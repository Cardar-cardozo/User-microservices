import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload, verify } from 'jsonwebtoken';
import { JWT_KEY } from 'src/config/env.config';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const Authorization = request.get('Authorization');
      if (!Authorization) {
        throw new UnauthorizedException('Unauthorized request');
      }
      const token = Authorization.split(' ');
      if (!((token[1] && token[0] === 'Bearer') || token[0] === 'bearer')) {
        throw new UnauthorizedException('Unauthorized request');
      }
      let decrypt: string | JwtPayload;
      try {
        decrypt = verify(token[1], JWT_KEY);
      } catch (e) {
        throw new UnauthorizedException('Unauthorized request');
      }

      if (!decrypt) {
        throw new UnauthorizedException('Unauthorized request');
      }

      request.user = decrypt;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Unauthorized request');
    }
  }
}
