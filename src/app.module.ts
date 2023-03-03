import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { DB_URL } from './config/env.config';
import { UserService } from './shared/services/user.service';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { RepositoryModule } from './repository/repository.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [
    MongooseModule.forRoot(DB_URL, {
      // poolSize: 50,
      keepAlive: true,
      socketTimeoutMS: 0,
      // useFindAndModify: false,
    }),
    SharedModule,
    RepositoryModule,
    CoreModule,
    ApiModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserService],
})
export class AppModule {}
