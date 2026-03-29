import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Error as MongooseError } from 'mongoose';
import { ApiResponse, ValidationErrorDetail, ValidationException } from './response.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const { httpStatus, message, errors } = this.resolveException(exception);

    // Log 5xx as error with stack trace, 4xx as warn
    if (httpStatus >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${httpStatus}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} ${httpStatus} - ${message}`);
    }

    const body: ApiResponse = { success: false, message };
    if (errors?.length) body.errors = errors;

    response.status(httpStatus).send(body);
  }

  private resolveException(exception: unknown): {
    httpStatus: number;
    message: string;
    errors?: ValidationErrorDetail[];
  } {
    // ── class-validator (ValidationPipe) ──────────────────
    if (exception instanceof ValidationException) {
      return {
        httpStatus: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors: exception.validationErrors,
      };
    }

    // ── NestJS HttpException (NotFoundException, etc.) ────
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      let msg: string;
      if (typeof res === 'string') {
        msg = res;
      } else if (typeof res === 'object' && res !== null && 'message' in res) {
        const raw = (res as { message: unknown }).message;
        msg = Array.isArray(raw) ? raw.join(', ') : String(raw);
      } else {
        msg = exception.message;
      }
      return { httpStatus: status, message: msg };
    }

    // ── Mongoose ValidationError ─────────────────────────
    if (exception instanceof MongooseError.ValidationError) {
      return {
        httpStatus: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Validation failed',
        errors: Object.entries(exception.errors).map(([field, err]) => ({
          field,
          messages: [err.message],
        })),
      };
    }

    // ── Mongoose CastError (invalid ObjectId, etc.) ──────
    if (exception instanceof MongooseError.CastError) {
      return {
        httpStatus: HttpStatus.BAD_REQUEST,
        message: `Invalid value for ${exception.path}`,
      };
    }

    // ── MongoDB duplicate key (code 11000) ───────────────
    if (this.isDuplicateKeyError(exception)) {
      const err = exception as { keyPattern?: Record<string, unknown> };
      const field = Object.keys(err.keyPattern ?? {})[0];
      return {
        httpStatus: HttpStatus.CONFLICT,
        message: field ? `${field} already exists` : 'Duplicate entry',
      };
    }

    // ── Unknown / unhandled ──────────────────────────────
    return {
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }

  private isDuplicateKeyError(exception: unknown): exception is { code: number; keyPattern?: Record<string, unknown> } {
    return (
      exception != null &&
      typeof exception === 'object' &&
      'code' in exception &&
      (exception as { code: unknown }).code === 11000
    );
  }
}
