import { HttpException, HttpStatus } from '@nestjs/common';

export class FileDeleteException extends HttpException {
  constructor(message: string, cause?: Error) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `File delete failed: ${message}`,
        error: 'File Delete Error',
        cause: cause?.message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
