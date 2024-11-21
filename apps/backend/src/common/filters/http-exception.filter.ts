import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  public catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const status = exception.getStatus();

    const responseBody: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: this.formatGeneralMessage(exception),
    };

    const fields = this.extractFields(exception);
    if (fields) {
      responseBody.fields = fields;
    }

    this.logger.error(
      `${request.method} ${request.url}`,
      exception.stack,
      'HttpExceptionFilter',
    );

    response.status(status).send(responseBody);
  }

  private formatGeneralMessage(exception: HttpException): string {
    const response = exception.getResponse();
    if (typeof response === 'string') {
      return response;
    } else if (
      typeof response === 'object'
      && response.hasOwnProperty('message')
    ) {
      if (Array.isArray(response['message'])) {
        return 'Validation failed';
      } else {
        return response['message'];
      }
    } else {
      return exception.message || 'An error occurred';
    }
  }

  private extractFields(exception: HttpException): any {
    const response = exception.getResponse();
    if (typeof response === 'object' && response.hasOwnProperty('message')) {
      if (Array.isArray(response['message'])) {
        const fields = response['message']
          .map((msg: any) => {
            if (typeof msg === 'object' && msg.field) {
              return { field: msg.field, errors: msg.errors || [] };
            }
            return null;
          })
          .filter((msg: any) => msg !== null);
        return fields.length > 0 ? fields : null;
      }
    }
    return null;
  }
}
