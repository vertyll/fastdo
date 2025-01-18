import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface ResponseWrapper<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
}

@Injectable()
export class WrapResponseInterceptor<T> implements NestInterceptor<T, ResponseWrapper<T>> {
  public intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseWrapper<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map(data => ({
        data,
        statusCode: response.statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: response.statusMessage || 'Success',
      })),
      catchError(error => {
        throw error;
      }),
    );
  }
}
