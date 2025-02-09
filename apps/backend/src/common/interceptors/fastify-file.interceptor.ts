import { MultipartFile } from '@fastify/multipart';
import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { I18nContext } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { Readable } from 'stream';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

interface CustomFileStream extends Readable {
  truncated: boolean;
  bytesRead: number;
  index: number;
}

@Injectable()
export class FastifyFileInterceptor implements NestInterceptor {
  constructor(private readonly fieldName: string) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const i18n = I18nContext.current<I18nTranslations>(context);
    if (!i18n) throw new Error('I18nContext not available');

    const request = context.switchToHttp().getRequest<FastifyRequest>();

    try {
      const parts = request.parts();
      request.body = await this.processFormData(parts, i18n);
      return next.handle();
    } catch (error) {
      this.handleFileError(error, i18n);
    }
  }

  private async processFormData(
    parts: AsyncIterableIterator<any>,
    i18n: I18nContext<I18nTranslations>,
  ): Promise<Record<string, any>> {
    const formData: Record<string, any> = {};

    try {
      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === this.fieldName) {
          const buffer = await this.streamToBuffer(part.file);
          formData[this.fieldName] = this.createMultipartFile(part, buffer);
        } else if (part.type === 'field') {
          formData[part.fieldname] = part.value;
        }
      }
    } catch (error) {
      this.handleFileError(error, i18n);
    }

    return formData;
  }

  private async streamToBuffer(stream: any): Promise<Buffer> {
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  private createMultipartFile(part: any, buffer: Buffer): MultipartFile {
    const fileStream = Object.assign(Readable.from(buffer), {
      truncated: false,
      bytesRead: buffer.length,
      index: 0,
    }) as CustomFileStream;

    return {
      toBuffer: () => Promise.resolve(buffer),
      file: fileStream,
      fieldname: part.fieldname,
      filename: part.filename,
      encoding: part.encoding,
      mimetype: part.mimetype,
      fields: {},
      type: 'file',
    };
  }

  private handleFileError(error: any, i18n: I18nContext<I18nTranslations>): never {
    console.error('File interceptor error:', error);

    if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
      const maxSize = (error.part?.file?.bytesRead / 1024 / 1024).toFixed(2);

      throw new BadRequestException({
        message: i18n.t('messages.File.errors.fileTooLarge', { args: { maxSize: `${maxSize}MB` } }),
        errors: {
          message: [
            {
              field: this.fieldName,
              errors: [i18n.t('messages.File.errors.fileTooLarge', { args: { maxSize: `${maxSize}MB` } })],
            },
          ],
        },
        error: i18n.t('messages.Validation.failed'),
        statusCode: 400,
      });
    }

    throw new BadRequestException({
      message: i18n.t('messages.File.errors.fileProcessingError'),
      errors: {
        message: [
          {
            field: this.fieldName,
            errors: [i18n.t('messages.File.errors.fileProcessingError')],
          },
        ],
      },
      error: i18n.t('messages.Validation.failed'),
      statusCode: 400,
    });
  }
}
