import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString, validateSync } from 'class-validator';
import * as dotenv from 'dotenv';

dotenv.config();

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumberString()
  PORT = 3000;

  @IsString()
  LOG_LEVEL = 'debug';

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  MONGODB_URI: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  APP_GLOBAL_PREFIX = 'api';

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  APP_DOCS_PATH = 'docs';

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  APP_DOCS_VERSION = '1.0';

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  APP_DOCS_TITLE = 'NestJS Mongoose Codebase';

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  APP_DOCS_DESCRIPTION = 'API documentation';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true }, // Important: Automatically convert '3000' -> 3000
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Config validation error: ${errors.toString()}`);
  }
  return validatedConfig;
}

export const envConfig = validate(process.env);
