import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export interface ValidationErrorDetail {
  field: string;
  messages: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationErrorDetail[];
}

export class ValidationException extends BadRequestException {
  public readonly validationErrors: ValidationErrorDetail[];

  constructor(errors: ValidationErrorDetail[]) {
    super('Validation failed');
    this.validationErrors = errors;
  }
}

export function formatValidationErrors(errors: ValidationError[], parentField = ''): ValidationErrorDetail[] {
  const result: ValidationErrorDetail[] = [];

  for (const error of errors) {
    const field = parentField ? `${parentField}.${error.property}` : error.property;

    if (error.constraints) {
      result.push({ field, messages: Object.values(error.constraints) });
    }

    if (error.children?.length) {
      result.push(...formatValidationErrors(error.children, field));
    }
  }

  return result;
}
