import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter, TransformInterceptor, ValidationException, formatValidationErrors } from './common/index';
import { Environment, envConfig } from './config/env.config.js';

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

  // Global prefix for all routes
  app.setGlobalPrefix(envConfig.APP_GLOBAL_PREFIX);

  // Global validation pipe — auto-validate DTOs via class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw if unknown properties present
      transform: true, // Auto-transform payloads to DTO instances
      exceptionFactory: (errors) => new ValidationException(formatValidationErrors(errors)),
    }),
  );

  // Global interceptor — auto-wrap successful responses into { success, message, data }
  app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));

  // Global exception filter — standardize all error responses
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger — only in non-production environments
  if (envConfig.NODE_ENV !== Environment.Production) {
    const config = new DocumentBuilder()
      .setTitle(envConfig.APP_DOCS_TITLE)
      .setDescription(envConfig.APP_DOCS_DESCRIPTION)
      .setVersion(envConfig.APP_DOCS_VERSION)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(envConfig.APP_DOCS_PATH, app, document);
    console.log(`Swagger UI available at http://localhost:${envConfig.PORT}/${envConfig.APP_DOCS_PATH}`);
  }

  await app.listen(envConfig.PORT);
}

void bootstrap();
