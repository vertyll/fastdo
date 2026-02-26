import { MultipartFile } from '@fastify/multipart';
import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { I18nContext } from 'nestjs-i18n';
import 'reflect-metadata';
import { Observable, throwError } from 'rxjs';
import { PassThrough, Readable } from 'node:stream';
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

export interface FastifyFileInterceptorOptions {
  maxFileSize?: number;
  maxFiles?: number;
  maxTotalSize?: number;
  multiple?: boolean;
  bufferThreshold?: number;
  forceBuffer?: boolean;
  forceStream?: boolean;
  streamBufferSize?: number;
}

interface ProcessedFile {
  multipartFile: MultipartFile;
  fileSize: number;
  isBuffered: boolean;
}

interface FormDataAccumulator {
  files: MultipartFile[];
  totalSize: number;
  fileCount: number;
  error: BadRequestException | null;
}

@Injectable()
export class FastifyFileInterceptor implements NestInterceptor {
  private readonly defaultOptions: Required<FastifyFileInterceptorOptions> = {
    maxFileSize: 10 * 1024 * 1024,
    maxFiles: 10,
    maxTotalSize: 100 * 1024 * 1024,
    multiple: false,
    bufferThreshold: 1024 * 1024,
    forceBuffer: false,
    forceStream: false,
    streamBufferSize: 64 * 1024,
  };

  private readonly options: Required<FastifyFileInterceptorOptions>;

  constructor(
    private readonly fieldName: string,
    private readonly dtoClass?: new () => any,
    options: FastifyFileInterceptorOptions = {},
  ) {
    this.options = { ...this.defaultOptions, ...options };

    if (this.options.forceBuffer && this.options.forceStream) {
      throw new Error('Cannot use both forceBuffer and forceStream options simultaneously');
    }
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const i18n = I18nContext.current<I18nTranslations>(context);
    if (!i18n) {
      throw new BadRequestException({
        message: 'I18nContext not available',
        error: 'Internal Server Error',
        statusCode: 500,
      });
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();

    try {
      const parts = request.parts();
      request.body = await this.processFormData(parts, i18n);
      return next.handle();
    } catch (error) {
      if (error instanceof BadRequestException) {
        return throwError(() => error);
      }
      return throwError(
        () =>
          new BadRequestException({
            message: error.message || i18n.t('messages.File.errors.fileProcessingError'),
            error: 'File processing failed',
            statusCode: 400,
          }),
      );
    }
  }

  private async processFormData(
    parts: AsyncIterableIterator<any>,
    i18n: I18nContext<I18nTranslations>,
  ): Promise<Record<string, any>> {
    const formData: Record<string, any> = {};
    const accumulator: FormDataAccumulator = { files: [], totalSize: 0, fileCount: 0, error: null };

    // Entire body must be consumed before throwing — Fastify won't send a response otherwise
    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === this.fieldName) {
        await this.processFilePart(part, accumulator, i18n);
      } else if (part.type === 'field' && !accumulator.error) {
        this.processFormField(formData, part);
      }
    }

    if (accumulator.error) {
      throw accumulator.error;
    }

    if (accumulator.files.length > 0) {
      formData[this.fieldName] = this.options.multiple ? accumulator.files : accumulator.files[0];
    }

    if (this.dtoClass) {
      this.applyTransformationsFromMetadata(formData, this.dtoClass);
    }

    return formData;
  }

  private async processFilePart(
    part: any,
    accumulator: FormDataAccumulator,
    i18n: I18nContext<I18nTranslations>,
  ): Promise<void> {
    // If a previous error occurred, drain the stream and skip processing
    if (accumulator.error) {
      await this.drainStream(part.file);
      return;
    }

    const fileCountError = this.validateFileCount(accumulator.fileCount, i18n);
    if (fileCountError) {
      accumulator.error = fileCountError;
      await this.drainStream(part.file);
      return;
    }

    const processedFile = await this.tryProcessFile(part, i18n);
    if (processedFile instanceof BadRequestException) {
      accumulator.error = processedFile;
      return;
    }

    const totalSizeError = this.validateTotalSize(accumulator.totalSize + processedFile.fileSize, i18n);
    if (totalSizeError) {
      accumulator.error = totalSizeError;
      return;
    }

    accumulator.files.push(processedFile.multipartFile);
    accumulator.totalSize += processedFile.fileSize;
    accumulator.fileCount++;
  }

  private validateFileCount(count: number, i18n: I18nContext<I18nTranslations>): BadRequestException | null {
    if (count >= this.options.maxFiles) {
      return new BadRequestException({
        message: i18n.t('messages.File.errors.tooManyFiles', {
          args: { maxFiles: this.options.maxFiles.toString() },
        }),
        error: 'Too many files',
        statusCode: 400,
      });
    }
    return null;
  }

  private validateTotalSize(totalSize: number, i18n: I18nContext<I18nTranslations>): BadRequestException | null {
    if (totalSize > this.options.maxTotalSize) {
      return new BadRequestException({
        message: i18n.t('messages.File.errors.totalSizeTooLarge', {
          args: { maxSize: `${(this.options.maxTotalSize / 1024 / 1024).toFixed(2)}MB` },
        }),
        error: 'Total size too large',
        statusCode: 400,
      });
    }
    return null;
  }

  private async tryProcessFile(
    part: any,
    i18n: I18nContext<I18nTranslations>,
  ): Promise<ProcessedFile | BadRequestException> {
    try {
      return await this.processFileIntelligently(part, i18n);
    } catch (error) {
      return error instanceof BadRequestException
        ? error
        : new BadRequestException({
            message: i18n.t('messages.File.errors.fileProcessingError'),
            error: 'File processing failed',
            statusCode: 400,
          });
    }
  }

  /**
   * Consumes a stream without storing data.
   * Required when rejecting a file to prevent the HTTP request from hanging.
   */
  private async drainStream(stream: any): Promise<void> {
    try {
      for await (const _ of stream) {
        // intentionally empty — data is discarded
      }
    } catch (_) {
      // errors during drain are non-critical and can be ignored
    }
  }

  private processFormField(formData: Record<string, any>, part: any): void {
    if (formData[part.fieldname] === undefined) {
      formData[part.fieldname] = part.value;
    } else if (Array.isArray(formData[part.fieldname])) {
      formData[part.fieldname].push(part.value);
    } else {
      formData[part.fieldname] = [formData[part.fieldname], part.value];
    }
  }

  private async processFileIntelligently(part: any, i18n: I18nContext<I18nTranslations>): Promise<ProcessedFile> {
    const shouldUseBuffer = this.options.forceBuffer || this.shouldUseBufferStrategy(part);
    return shouldUseBuffer ? this.processFileWithBuffer(part, i18n) : this.processFileWithStream(part, i18n);
  }

  private shouldUseBufferStrategy(part: any): boolean {
    if (this.options.forceStream) return false;
    if (this.options.forceBuffer) return true;

    if (part.headers?.['content-length']) {
      const estimatedSize = Number.parseInt(part.headers['content-length'], 10);
      return estimatedSize <= this.options.bufferThreshold;
    }

    // Default to streaming for unknown sizes (safer for memory)
    return false;
  }

  private async processFileWithBuffer(part: any, i18n: I18nContext<I18nTranslations>): Promise<ProcessedFile> {
    const chunks: Buffer[] = [];
    let currentSize = 0;

    for await (const chunk of part.file) {
      currentSize += chunk.length;

      if (currentSize > this.options.maxFileSize) {
        await this.drainStream(part.file);
        throw new BadRequestException({
          message: i18n.t('messages.File.errors.fileTooLarge', {
            args: { maxSize: `${(this.options.maxFileSize / 1024 / 1024).toFixed(2)}MB` },
          }),
          error: 'File too large',
          statusCode: 400,
        });
      }

      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    return { multipartFile: this.createMultipartFileFromBuffer(part, buffer), fileSize: currentSize, isBuffered: true };
  }

  private async processFileWithStream(part: any, i18n: I18nContext<I18nTranslations>): Promise<ProcessedFile> {
    const passThrough = new PassThrough();
    let currentSize = 0;

    await new Promise<void>((resolve, reject) => {
      part.file.on('data', (chunk: Buffer) => {
        currentSize += chunk.length;

        if (currentSize > this.options.maxFileSize) {
          const error = new BadRequestException({
            message: i18n.t('messages.File.errors.fileTooLarge', {
              args: { maxSize: `${(this.options.maxFileSize / 1024 / 1024).toFixed(2)}MB` },
            }),
            error: 'File too large',
            statusCode: 400,
          });
          passThrough.destroy(error);
          reject(error);
          return;
        }

        if (!passThrough.destroyed) {
          passThrough.write(chunk);
        }
      });

      part.file.on('end', () => {
        if (!passThrough.destroyed) passThrough.end();
        resolve();
      });

      part.file.on('error', (error: Error) => {
        if (!passThrough.destroyed) passThrough.destroy(error);
        reject(error);
      });
    });

    return {
      multipartFile: this.createMultipartFileFromStream(part, passThrough, currentSize),
      fileSize: currentSize,
      isBuffered: false,
    };
  }

  private createMultipartFileFromBuffer(part: any, buffer: Buffer): MultipartFile {
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

  private createMultipartFileFromStream(part: any, stream: PassThrough, size: number): MultipartFile {
    const fileStream = Object.assign(stream, {
      truncated: false,
      bytesRead: size,
      index: 0,
    }) as CustomFileStream;

    return {
      toBuffer: async (): Promise<Buffer> => {
        if (stream.readableEnded) return Buffer.alloc(0);

        const chunks: Buffer[] = [];
        return new Promise((resolve, reject) => {
          stream.on('data', (chunk: Buffer) => chunks.push(chunk));
          stream.on('end', () => resolve(Buffer.concat(chunks)));
          stream.on('error', reject);
        });
      },
      file: fileStream,
      fieldname: part.fieldname,
      filename: part.filename,
      encoding: part.encoding,
      mimetype: part.mimetype,
      fields: {},
      type: 'file',
    };
  }

  private applyTransformationsFromMetadata(formData: Record<string, any>, dtoClass: new () => any): void {
    const arrayFields = this.getMetadataFromClassChain(dtoClass, MULTIPART_ARRAY_FIELDS);
    const booleanFields = this.getMetadataFromClassChain(dtoClass, MULTIPART_BOOLEAN_FIELDS);
    const numberFields = this.getMetadataFromClassChain(dtoClass, MULTIPART_NUMBER_FIELDS);
    const jsonFields = this.getMetadataFromClassChain(dtoClass, MULTIPART_JSON_FIELDS);

    this.transformArrayFields(formData, arrayFields);
    this.transformJsonFields(formData, jsonFields);
    this.transformBooleanFields(formData, booleanFields);
    this.transformNumberFields(formData, numberFields);

    if (formData[this.fieldName] && !Array.isArray(formData[this.fieldName]) && this.options.multiple) {
      formData[this.fieldName] = [formData[this.fieldName]];
    }
  }

  private transformArrayFields(formData: Record<string, any>, fields: string[]): void {
    fields.forEach(field => {
      if (formData[field] === undefined) return;

      if (typeof formData[field] === 'string') {
        try {
          const parsed = JSON.parse(formData[field]);
          formData[field] = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          formData[field] = [formData[field]];
        }
      } else if (!Array.isArray(formData[field])) {
        formData[field] = [formData[field]];
      }
    });
  }

  private transformJsonFields(formData: Record<string, any>, fields: string[]): void {
    fields.forEach(field => {
      if (formData[field] === undefined || typeof formData[field] !== 'string') return;

      try {
        formData[field] = JSON.parse(formData[field]);
      } catch {
        formData[field] = [];
      }
    });
  }

  private transformBooleanFields(formData: Record<string, any>, fields: string[]): void {
    fields.forEach(field => {
      if (formData[field] === undefined) return;

      formData[field] =
        typeof formData[field] === 'string' ? formData[field].toLowerCase() === 'true' : Boolean(formData[field]);
    });
  }

  private transformNumberFields(formData: Record<string, any>, fields: string[]): void {
    fields.forEach(field => {
      if (formData[field] === undefined || formData[field] === '' || typeof formData[field] !== 'string') return;

      const num = Number(formData[field]);
      if (!Number.isNaN(num)) {
        formData[field] = num;
      }
    });
  }

  private getMetadataFromClassChain(targetClass: any, metadataKey: symbol): string[] {
    const fields: string[] = [];

    try {
      const classFields: string[] = Reflect.getMetadata(metadataKey, targetClass) || [];
      fields.push(...classFields);
    } catch (_) {
      // missing metadata is expected
    }

    try {
      const baseClasses: any[] = Reflect.getMetadata(MULTIPART_BASE_CLASSES, targetClass) || [];
      for (const baseClass of baseClasses) {
        const baseFields: string[] = Reflect.getMetadata(metadataKey, baseClass) || [];
        fields.push(...baseFields);
      }
    } catch (_) {
      // missing metadata is expected
    }

    return [...new Set(fields)];
  }
}
