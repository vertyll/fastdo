import { NotFoundException } from '@nestjs/common';

export class FileNotFoundException extends NotFoundException {
  constructor(fileId: string) {
    super({
      statusCode: 404,
      message: `File with id ${fileId} not found`,
      error: 'File Not Found',
    });
  }
}
