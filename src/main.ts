import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { envConfig } from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      // Enable trust proxy if behind reverse proxy (nginx, load balancer)
      // trustProxy: true,

      logger: false, // Use NestJS logger instead of Fastify's built-in
    }),
    {
      bufferLogs: true, // Buffer logs until Winston is ready
    },
  );

  // Replace NestJS default logger with Winston globally
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  await app.listen(envConfig.PORT);
}
void bootstrap();
