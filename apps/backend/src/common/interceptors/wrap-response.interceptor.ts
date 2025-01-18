import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface ResponseWrapper<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  errors?: any;
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
        const errorResponse: ResponseWrapper<null> = {
          data: null,
          statusCode: error instanceof HttpException ? error.getStatus() : 500,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          message: error.message || 'Internal server error',
        };

        if (error instanceof BadRequestException) {
          const validationErrors = error.getResponse();
          if (typeof validationErrors === 'object' && validationErrors.hasOwnProperty('message')) {
            errorResponse.errors = validationErrors;
          }
        }

        if (!(error instanceof HttpException)) {
          throw new InternalServerErrorException(errorResponse);
        }

        throw new HttpException(errorResponse, error.getStatus());
      }),
    );
  }
}
