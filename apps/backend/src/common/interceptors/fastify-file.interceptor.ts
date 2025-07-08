import { MultipartFile } from '@fastify/multipart';
import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { I18nContext } from 'nestjs-i18n';
import 'reflect-metadata';
import { Observable } from 'rxjs';
import { Readable } from 'stream';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import {
  MULTIPART_ARRAY_FIELDS,
  MULTIPART_BASE_CLASSES,
  MULTIPART_BOOLEAN_FIELDS,
  MULTIPART_JSON_FIELDS,
  MULTIPART_NUMBER_FIELDS,
} from '../decorators/multipart-transform.decorator';

interface CustomFileStream extends Readable {
  truncated: boolean;
  bytesRead: number;
  index: number;
}

@Injectable()
export class FastifyFileInterceptor implements NestInterceptor {
  constructor(
    private readonly fieldName: string,
    private readonly dtoClass?: new() => any,
  ) {}

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
          if (formData[part.fieldname] !== undefined) {
            if (Array.isArray(formData[part.fieldname])) {
              formData[part.fieldname].push(part.value);
            } else {
              formData[part.fieldname] = [formData[part.fieldname], part.value];
            }
          } else {
            formData[part.fieldname] = part.value;
          }
        }
      }
    } catch (error) {
      this.handleFileError(error, i18n);
    }

    if (this.dtoClass) {
      this.applyTransformationsFromMetadata(formData, this.dtoClass);
    }

    return formData;
  }

  private applyTransformationsFromMetadata(formData: Record<string, any>, dtoClass: new() => any): void {
    const arrayFields = this.getMetadataFromClassChain(dtoClass, MULTIPART_ARRAY_FIELDS);
    const booleanFields = this.getMetadataFromClassChain(dtoClass, MULTIPART_BOOLEAN_FIELDS);
    const numberFields = this.getMetadataFromClassChain(dtoClass, MULTIPART_NUMBER_FIELDS);
    const jsonFields = this.getMetadataFromClassChain(dtoClass, MULTIPART_JSON_FIELDS);

    jsonFields.forEach(field => {
      if (formData[field] !== undefined) {
        if (typeof formData[field] === 'string') {
          try {
            formData[field] = JSON.parse(formData[field]);
          } catch {
            formData[field] = [];
          }
        }
      }
    });

    arrayFields.forEach(field => {
      if (!jsonFields.includes(field) && formData[field] && !Array.isArray(formData[field])) {
        formData[field] = [formData[field]];
      }
    });

    booleanFields.forEach(field => {
      if (formData[field] !== undefined) {
        if (typeof formData[field] === 'string') {
          formData[field] = formData[field].toLowerCase() === 'true';
        } else {
          formData[field] = Boolean(formData[field]);
        }
      }
    });

    numberFields.forEach(field => {
      if (formData[field] !== undefined && formData[field] !== '') {
        if (typeof formData[field] === 'string') {
          const num = Number(formData[field]);
          if (!isNaN(num)) {
            formData[field] = num;
          }
        }
      }
    });
  }

  private getMetadataFromClassChain(targetClass: any, metadataKey: symbol): string[] {
    const fields: string[] = [];

    try {
      const classFields: string[] = Reflect.getMetadata(metadataKey, targetClass) || [];
      fields.push(...classFields);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Silent error - no metadata is a normal situation
    }

    try {
      const baseClasses: any[] = Reflect.getMetadata(MULTIPART_BASE_CLASSES, targetClass) || [];

      for (const baseClass of baseClasses) {
        const baseFields: string[] = Reflect.getMetadata(metadataKey, baseClass) || [];
        fields.push(...baseFields);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Silent error - no metadata is a normal situation
    }

    // Remove duplicates
    return [...new Set(fields)];
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
      const maxSize = (error.part.file.bytesRead / 1024 / 1024).toFixed(2);
      throw new BadRequestException({
        message: i18n.t('messages.File.errors.fileTooLarge', {
          args: { maxSize: `${maxSize}MB` },
        }),
        error: error.message,
        statusCode: 400,
      });
    }

    throw new BadRequestException({
      message: error.message,
      error: i18n.t('messages.File.errors.fileProcessingError'),
      statusCode: 400,
    });
  }
}
