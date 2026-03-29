import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsNumberString, IsOptional, IsString, validateSync } from 'class-validator';
import * as dotenv from 'dotenv';

dotenv.config();

enum Environment {
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
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  MONGODB_URI: string;
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
