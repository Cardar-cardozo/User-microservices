import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RepositoryModule } from 'src/repository/repository.module';
import { UserService } from './services/user.service';

@Module({
  imports: [ConfigModule, RepositoryModule],
  providers: [UserService],
  exports: [UserService],
})
export class SharedModule {}
