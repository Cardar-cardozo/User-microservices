import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { config } from 'dotenv';
import { CoreModule } from 'src/core/core.module';
import { SharedModule } from 'src/shared/shared.module';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [ConfigModule.forFeature(config), CoreModule, SharedModule],
  controllers: [AuthController],
})
export class ApiModule {}
