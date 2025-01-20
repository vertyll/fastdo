import { BadRequestException } from '@nestjs/common';
import { StorageType } from '../enums/storage-type.enum';

export class InvalidStorageTypeException extends BadRequestException {
  constructor(type: StorageType | string) {
    super({
      statusCode: 400,
      message: `Invalid storage type: ${type}`,
      error: 'Invalid Storage Type',
    });
  }
}
