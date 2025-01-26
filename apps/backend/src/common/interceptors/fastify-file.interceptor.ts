import { MultipartFile } from '@fastify/multipart';
import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { I18nContext } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

@Injectable()
export class FastifyFileInterceptor implements NestInterceptor {
  constructor(
    private fieldName: string,
  ) {}

  public async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const i18n = I18nContext.current<I18nTranslations>(context);
    if (!i18n) throw new Error('I18nContext not available');

    const request = context.switchToHttp().getRequest<FastifyRequest>();

    const file = await this.extractFile(request, this.fieldName, i18n);

    if (!file) {
      throw new BadRequestException(
        i18n.t('messages.File.errors.fileNotUploaded'),
      );
    }

    (request as any).incomingFile = file;
    return next.handle();
  }

  private async extractFile(
    request: FastifyRequest,
    fieldName: string,
    i18n: I18nContext<I18nTranslations>,
  ): Promise<MultipartFile | null> {
    if (request.body && (request.body as any)[fieldName]) {
      return (request.body as any)[fieldName];
    }

    try {
      if ('file' in request) {
        const file = await (request as any).file();
        if (file?.fieldname === fieldName) {
          return file;
        }
      }

      if ('parts' in request) {
        const parts = (request as any).parts();
        for await (const part of parts) {
          if (part.type === 'file' && part.fieldname === fieldName) {
            return part;
          }
        }
      }
    } catch (error) {
      console.error(i18n.t('messages.File.errors.fileNotProvided'), error);
    }

    return null;
  }
}
