import { BadRequestException, Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { JWT_KEY } from 'src/config/env.config';
import { User, UserType } from 'src/repository/schemas/user.schema';
import { UserService } from 'src/shared/services/user.service';

@Injectable()
export class AuthService {
  constructor(private userSvc: UserService) {}

  async validateUser(emailOrUserName: string, pass: string): Promise<any> {
    const response = {
      success: false,
      code: 100,
      message: 'Invalid email or password',
      data: {
        authenticated: false,
        user: null,
        userProfile: null,
        accessToken: null,
      },
    };

    const user: User = await this.userSvc.validUser(
      emailOrUserName,
      emailOrUserName,
    );

    if (!user) {
      return response;
    }

    if (!user.verified) {
      response['message'] = 'Account not verified';
      return response;
    }

    if (!user.validPassword(pass)) {
      response.code = 101;

      return response;
    }

    const payload: any = user.JWTPayload(user.userType);

    response.data.accessToken = this.signPayload({ ...payload });
    response.data.user = user;

    delete response.data.user['hash'];
    delete response.data.user['salt'];

    response.code = 102;
    response.message = 'Authenticated';
    response.data.authenticated = true;

    return response;
  }

  async login(validUser: any): Promise<{ data: any }> {
    return validUser;
  }

  signPayload(payload: any): string {
    return sign(payload, JWT_KEY, { issuer: 'user' });
  }

  verifyToken(token): any {
    return verify(token, JWT_KEY);
  }
}
