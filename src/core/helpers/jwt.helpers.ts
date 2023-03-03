import { sign } from 'jsonwebtoken';
import { JWT_KEY } from 'src/config/env.config';

export class JwtHelper {
  static async signToken(user: string | object | Buffer) {
    return sign(user, JWT_KEY, { expiresIn: '1hr' });
  }

  static async refreshJWT(user: string | object | Buffer) {
    const token = await this.signToken(user);
    return {
      token,
    };
  }
}
