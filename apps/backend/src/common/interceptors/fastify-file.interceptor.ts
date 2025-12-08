import { MultipartFile } from '@fastify/multipart';
import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { I18nContext } from 'nestjs-i18n';
import 'reflect-metadata';
import { Observable } from 'rxjs';
import { PassThrough, Readable } from 'stream';
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

@Injectable()
export class FastifyFileInterceptor implements NestInterceptor {
  private readonly defaultOptions: Required<FastifyFileInterceptorOptions> = {
    maxFileSize: 10 * 1024 * 1024, // 10MB per file
    maxFiles: 10, // max 10 files
    maxTotalSize: 100 * 1024 * 1024, // 100MB total
    multiple: false,
    bufferThreshold: 1024 * 1024, // 1MB threshold
    forceBuffer: false,
    forceStream: false,
    streamBufferSize: 64 * 1024, // 64KB buffer for streaming
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
      this.handleFileError(error, i18n);
    }
  }

  private async processFormData(
    parts: AsyncIterableIterator<any>,
    i18n: I18nContext<I18nTranslations>,
  ): Promise<Record<string, any>> {
    const formData: Record<string, any> = {};
    const files: MultipartFile[] = [];
    let totalSize = 0;
    let fileCount = 0;

    try {
      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === this.fieldName) {
          // Validate file count early
          if (fileCount >= this.options.maxFiles) {
            throw new BadRequestException({
              message: i18n.t('messages.File.errors.tooManyFiles', {
                args: { maxFiles: this.options.maxFiles.toString() },
              }),
              error: 'Too many files',
              statusCode: 400,
            });
          }

          // Smart processing: buffer or stream based on intelligent choice
          const processedFile = await this.processFileIntelligently(part, i18n);

          // Validate total size
          totalSize += processedFile.fileSize;
          if (totalSize > this.options.maxTotalSize) {
            throw new BadRequestException({
              message: i18n.t('messages.File.errors.totalSizeTooLarge', {
                args: { maxSize: `${(this.options.maxTotalSize / 1024 / 1024).toFixed(2)}MB` },
              }),
              error: 'Total size too large',
              statusCode: 400,
            });
          }

          files.push(processedFile.multipartFile);
          fileCount++;

          // console.log(
          //   `FastifyFileInterceptor: processed file ${part.filename}, size: ${processedFile.fileSize} bytes, buffered: ${processedFile.isBuffered}`,
          // );
        } else if (part.type === 'field') {
          this.processFormField(formData, part);
        }
      }
    } catch (error) {
      this.handleFileError(error, i18n);
    }

    // Assign files to formData based on multiple flag
    if (files.length > 0) {
      formData[this.fieldName] = this.options.multiple ? files : files[0];

      // console.log(
      //   `FastifyFileInterceptor: fieldName=${this.fieldName}, multiple=${this.options.multiple}, filesCount=${files.length}`,
      // );
    }

    if (this.dtoClass) {
      this.applyTransformationsFromMetadata(formData, this.dtoClass);
    }

    return formData;
  }

  private processFormField(formData: Record<string, any>, part: any): void {
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

  private async processFileIntelligently(part: any, i18n: I18nContext<I18nTranslations>): Promise<ProcessedFile> {
    // Determine processing strategy
    const shouldUseBuffer = this.options.forceBuffer || this.shouldUseBufferStrategy(part);

    if (shouldUseBuffer) {
      return this.processFileWithBuffer(part, i18n);
    } else {
      return this.processFileWithStream(part, i18n);
    }
  }

  private shouldUseBufferStrategy(part: any): boolean {
    // forceStream has priority over forceBuffer
    if (this.options.forceStream) {
      return false;
    }

    if (this.options.forceBuffer) {
      return true;
    }

    // For small files, use buffer for better performance
    // For large files, use streaming to save memory

    // If we can estimate size from headers, use that
    if (part.headers && part.headers['content-length']) {
      const estimatedSize = parseInt(part.headers['content-length'], 10);
      return estimatedSize <= this.options.bufferThreshold;
    }

    // Default to streaming for unknown sizes (safer for memory)
    return false;
  }

  private async processFileWithBuffer(part: any, i18n: I18nContext<I18nTranslations>): Promise<ProcessedFile> {
    const chunks: Buffer[] = [];
    let currentSize = 0;

    try {
      for await (const chunk of part.file) {
        currentSize += chunk.length;

        // Early size validation
        if (currentSize > this.options.maxFileSize) {
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
      const multipartFile = this.createMultipartFileFromBuffer(part, buffer);

      return { multipartFile, fileSize: currentSize, isBuffered: true };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: i18n.t('messages.File.errors.fileProcessingError'),
        error: error.message || 'File processing failed',
        statusCode: 400,
      });
    }
  }

  private async processFileWithStream(part: any, i18n: I18nContext<I18nTranslations>): Promise<ProcessedFile> {
    const passThrough = new PassThrough();
    let currentSize = 0;
    let streamError: Error | null = null;

    // Create a promise that resolves when streaming is complete
    const streamPromise = new Promise<void>((resolve, reject) => {
      part.file.on('data', (chunk: Buffer) => {
        currentSize += chunk.length;

        // Real-time size validation during streaming
        if (currentSize > this.options.maxFileSize) {
          const error = new BadRequestException({
            message: i18n.t('messages.File.errors.fileTooLarge', {
              args: { maxSize: `${(this.options.maxFileSize / 1024 / 1024).toFixed(2)}MB` },
            }),
            error: 'File too large',
            statusCode: 400,
          });
          streamError = error;
          passThrough.destroy(error);
          reject(error);
          return;
        }

        // Write to pass-through stream
        if (!passThrough.destroyed) {
          passThrough.write(chunk);
        }
      });

      part.file.on('end', () => {
        if (!passThrough.destroyed) {
          passThrough.end();
        }
        resolve();
      });

      part.file.on('error', (error: Error) => {
        streamError = error;
        if (!passThrough.destroyed) {
          passThrough.destroy(error);
        }
        reject(error);
      });
    });

    try {
      await streamPromise;

      if (streamError) {
        throw streamError;
      }

      const multipartFile = this.createMultipartFileFromStream(part, passThrough, currentSize);

      return { multipartFile, fileSize: currentSize, isBuffered: false };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: i18n.t('messages.File.errors.fileProcessingError'),
        error: error.message || 'File streaming failed',
        statusCode: 400,
      });
    }
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
        // Convert stream to buffer when needed
        const chunks: Buffer[] = [];

        return new Promise((resolve, reject) => {
          stream.on('data', (chunk: Buffer) => chunks.push(chunk));
          stream.on('end', () => resolve(Buffer.concat(chunks)));
          stream.on('error', reject);

          // If stream is already ended, return empty buffer
          if (stream.readableEnded) {
            resolve(Buffer.alloc(0));
          }
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

    arrayFields.forEach(field => {
      if (formData[field] !== undefined) {
        if (typeof formData[field] === 'string') {
          try {
            const parsed = JSON.parse(formData[field]);
            formData[field] = Array.isArray(parsed) ? parsed : [parsed];
          } catch (error) {
            console.warn(`Failed to parse JSON for array field ${field}, treating as single value:`, error);
            formData[field] = [formData[field]];
          }
        } else if (!Array.isArray(formData[field])) {
          formData[field] = [formData[field]];
        }
      }
    });

    jsonFields.forEach(field => {
      if (formData[field] !== undefined) {
        if (typeof formData[field] === 'string') {
          try {
            formData[field] = JSON.parse(formData[field]);
          } catch (error) {
            console.warn(`Failed to parse JSON for field ${field}:`, error);
            formData[field] = [];
          }
        }
      }
    });

    // Ensure file field is properly typed for multiple uploads
    if (formData[this.fieldName] && !Array.isArray(formData[this.fieldName]) && this.options.multiple) {
      formData[this.fieldName] = [formData[this.fieldName]];
    }

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
    } catch (_) {
      // Silent error - no metadata is normal
    }

    try {
      const baseClasses: any[] = Reflect.getMetadata(MULTIPART_BASE_CLASSES, targetClass) || [];
      for (const baseClass of baseClasses) {
        const baseFields: string[] = Reflect.getMetadata(metadataKey, baseClass) || [];
        fields.push(...baseFields);
      }
    } catch (_) {
      // Silent error - no metadata is normal
    }

    return [...new Set(fields)];
  }

  private handleFileError(error: any, i18n: I18nContext<I18nTranslations>): never {
    console.error('File interceptor error:', error);

    // Handle specific Fastify errors
    if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
      throw new BadRequestException({
        message: i18n.t('messages.File.errors.fileTooLarge', {
          args: { maxSize: `${(this.options.maxFileSize / 1024 / 1024).toFixed(2)}MB` },
        }),
        error: 'File too large',
        statusCode: 400,
      });
    }

    if (error.code === 'FST_FILES_LIMIT') {
      throw new BadRequestException({
        message: i18n.t('messages.File.errors.tooManyFiles', {
          args: { maxFiles: this.options.maxFiles.toString() },
        }),
        error: 'Too many files',
        statusCode: 400,
      });
    }

    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new BadRequestException({
      message: error.message || i18n.t('messages.File.errors.fileProcessingError'),
      error: 'File processing failed',
      statusCode: 400,
    });
  }
}
