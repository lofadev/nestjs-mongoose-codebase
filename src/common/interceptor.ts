import { ApiResponse, RESPONSE_MESSAGE_KEY } from '@/common';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    const message = this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ?? 'Success';

    return next.handle().pipe(map((data) => ({ success: true, message, data })));
  }
}
