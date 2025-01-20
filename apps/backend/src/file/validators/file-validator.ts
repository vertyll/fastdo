import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { FileConfigService } from '../config/file-config';
import { FileValidationException } from '../exceptions/file-validation.exception';
import { FileUploadOptions } from '../interfaces/file-upload-options.interface';

@Injectable()
export class FileValidator {
  constructor(private readonly fileConfigService: FileConfigService) {}

  async validate(file: MultipartFile, options?: FileUploadOptions): Promise<void> {
    const config = this.fileConfigService.getConfig();

    const maxSize = options?.maxSize || config.validation.maxSize;
    if (file.file.bytesRead > maxSize) {
      throw new FileValidationException(
        `File size exceeds maximum allowed size of ${maxSize} bytes`,
      );
    }

    const allowedTypes = options?.allowedMimeTypes || config.validation.allowedMimeTypes;
    if (!allowedTypes.includes(file.mimetype)) {
      throw new FileValidationException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }
  }
}
