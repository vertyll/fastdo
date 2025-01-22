import { BadRequestException } from '@nestjs/common';

export class FileValidationException extends BadRequestException {
  constructor(message: string) {
    super({
      statusCode: 400,
      message,
      error: 'File Validation Error',
    });
  }
}
