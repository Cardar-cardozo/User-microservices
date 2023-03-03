import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { AuthService } from 'src/core/services/auth/auth/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private moduleRef: ModuleRef) {
    super({
      passReqToCallback: true,
      usernameField: 'emailOrUserName',
      passwordField: 'password',
    });
  }

  async validate(
    request: Request | any,
    email: string,
    password: string,
  ): Promise<any> {
    // console.log('validate - ', email);
    const contextId = ContextIdFactory.getByRequest(request);
    const authService = await this.moduleRef.resolve(AuthService, contextId);
    const user = await authService.validateUser(email, password);
    //   console.log(user)

    if (!user?.data?.authenticated) {
      console.error('unauthorized user');
      throw new UnauthorizedException(user);
    }
    return user;
  }
}
