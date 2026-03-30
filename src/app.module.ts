import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envConfig, winstonConfig } from './config';
import { AuthModule, JwtAuthGuard, RolesGuard } from './modules/auth';
import { UserModule } from './modules/user';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    MongooseModule.forRoot(envConfig.MONGODB_URI),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }, { provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {}
