import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { config } from 'dotenv';
import { JWT_KEY } from 'src/config/env.config';
import { JwtStrategy } from 'src/provider/passport.jwt.strategy';
import { LocalStrategy } from 'src/provider/passport.local.strategy';
import { SharedModule } from 'src/shared/shared.module';
import { AuthService } from './services/auth/auth/auth.service';

@Module({
  imports: [
    ConfigModule.forFeature(config),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secretOrPrivateKey: JWT_KEY,
      secret: JWT_KEY,
      signOptions: { expiresIn: '60s' },
    }),
    SharedModule,
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class CoreModule {}
