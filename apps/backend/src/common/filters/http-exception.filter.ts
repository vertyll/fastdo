import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { ApiErrorResponse } from '../types/api-responses.interface';

interface ValidationFieldError {
  field: string;
  errors: string[];
}

interface ResponseBody {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  fields?: ValidationFieldError[];
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  private getI18n(host: ArgumentsHost): I18nContext<I18nTranslations> {
    const i18n = I18nContext.current<I18nTranslations>(host);
    if (!i18n) throw new Error('I18nContext not available');
    
    return i18n;
  }

  public catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const status = exception.getStatus();
    const i18n = this.getI18n(host);

    const responseBody: ResponseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: this.formatGeneralMessage(exception, i18n),
    };

    const fields = this.extractFields(exception);
    if (fields) responseBody.fields = fields;

    this.logger.error(
      `${request.method} ${request.url}`,
      exception.stack,
      'HttpExceptionFilter',
    );

    response.status(status).send(responseBody);
  }

  private formatGeneralMessage(exception: HttpException, i18n: I18nContext<I18nTranslations>): string {
    const response = exception.getResponse() as ApiErrorResponse;
    if (
      typeof response === 'object'
      && response.message
    ) {
      if (Array.isArray(response.message)) {
        return i18n.t('messages.Validation.failed');
      } else {
        return response.message;
      }
    } else {
      return exception.message || i18n.t('messages.Validation.errorOccurred');
    }
  }

  private extractFields(exception: HttpException): ValidationFieldError[] | null {
    const response = exception.getResponse() as ApiErrorResponse;
    if (typeof response === 'object' && response.message) {
      if (Array.isArray(response.message)) {
        const fields = response.message
          .map((msg: any) => {
            if (typeof msg === 'object' && msg.field) {
              return { field: msg.field, errors: msg.errors || [] };
            }
            return null;
          })
          .filter((msg: any) => msg !== null) as ValidationFieldError[];
        
        return fields.length > 0 ? fields : null;
      }
    }
    return null;
  }
}
