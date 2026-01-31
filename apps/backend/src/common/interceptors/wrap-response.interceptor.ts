import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
  ValidationError,
} from '@nestjs/common';
import { I18nContext, I18nValidationException } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { I18nPath, I18nTranslations } from '../../generated/i18n/i18n.generated';
import { ApiResponseWrapper } from '../types/api-responses.interface';

interface ValidationErrorType extends ValidationError {
  property: string;
  constraints?: Record<string, string>;
}

@Injectable()
export class WrapResponseInterceptor<T> implements NestInterceptor<T, ApiResponseWrapper<T>> {
  private getI18n(host: ExecutionContext): I18nContext<I18nTranslations> {
    const i18n = I18nContext.current<I18nTranslations>(host);
    if (!i18n) throw new Error('I18nContext not available');
    return i18n;
  }

  public intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponseWrapper<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const i18n = this.getI18n(context);

    return next.handle().pipe(
      map(data => ({
        data,
        statusCode: response.statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: response.statusMessage || i18n.t<I18nPath>('messages.Common.success'),
      })),
      catchError(error => {
        const errorResponse: ApiResponseWrapper<null> = {
          data: null,
          statusCode: error instanceof HttpException ? error.getStatus() : 500,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          message: error.message || i18n.t<I18nPath>('messages.Errors.InternalServerError'),
        };

        if (error instanceof I18nValidationException && Array.isArray(error.errors)) {
          errorResponse.errors = {
            message: error.errors.map((err: ValidationErrorType) => ({
              field: err.property,
              errors: Object.values(err.constraints || {}).map(constraint => {
                const [key, paramsStr] = constraint.split('|');
                const params = paramsStr ? JSON.parse(paramsStr) : {};
                const translationParams = params.args || params;
                return i18n.t(key as I18nPath, {
                  args: translationParams,
                  defaultValue: String(i18n.t<I18nPath>('messages.Validation.errorOccurred')), // NOSONAR
                });
              }),
            })),
            error: i18n.t<I18nPath>('messages.Validation.failed'),
            statusCode: 400,
          };
        } else if (error instanceof BadRequestException) {
          const validationErrors = error.getResponse();
          if (typeof validationErrors === 'object' && validationErrors.hasOwnProperty('message')) {
            errorResponse.errors = validationErrors;
          }
        }

        if (!(error instanceof HttpException)) throw new InternalServerErrorException(errorResponse);

        throw new HttpException(errorResponse, error.getStatus());
      }),
    );
  }
}
