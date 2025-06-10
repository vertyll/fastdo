import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n/i18n.generated';
import { FileConfigService } from '../config/file-config';
import { FileValidationException } from '../exceptions/file-validation.exception';
import { FileUploadOptions } from '../types/file-upload-options.interface';

@Injectable()
export class FileValidator {
  constructor(
    private readonly fileConfigService: FileConfigService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  public async validate(file: MultipartFile, options?: FileUploadOptions): Promise<void> {
    const config = this.fileConfigService.getConfig();

    const maxSize = options?.maxSize || config.validation.maxSize;
    if (file.file.bytesRead > maxSize) {
      throw new FileValidationException(
        this.i18n,
        this.i18n.t('messages.File.errors.exceededMaxFileSize', { args: { maxSize } }),
      );
    }

    const allowedTypes = options?.allowedMimeTypes || config.validation.allowedMimeTypes;
    if (!allowedTypes.includes(file.mimetype)) {
      throw new FileValidationException(
        this.i18n,
        this.i18n.t('messages.File.errors.fileTypeNotAllowed', { args: { mimeType: file.mimetype, allowedTypes } }),
      );
    }
  }
}
