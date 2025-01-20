import { HttpException, HttpStatus } from '@nestjs/common';

export class FileUploadException extends HttpException {
  constructor(message: string, cause?: Error) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `File upload failed: ${message}`,
        error: 'File Upload Error',
        cause: cause?.message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
