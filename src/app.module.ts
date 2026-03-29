import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { envConfig } from './config/env.config.js';
import { winstonConfig } from './config/logger.config.js';

@Module({
  imports: [WinstonModule.forRoot(winstonConfig), MongooseModule.forRoot(envConfig.MONGODB_URI)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
