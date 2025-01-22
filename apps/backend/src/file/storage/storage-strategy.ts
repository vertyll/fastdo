import { Injectable } from '@nestjs/common';
import { StorageType } from 'src/config/types/app.config.type';
import { FileConfigService } from '../config/file-config';
import { InvalidStorageTypeException } from '../exceptions/invalid-storage-type.exception';
import { FileStorage } from '../interfaces/file-storage.interface';
import { LocalStorageService } from './providers/local-storage.service';

@Injectable()
export class StorageStrategy {
  private readonly storageProviders: Map<StorageType, FileStorage>;

  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly fileConfigService: FileConfigService,
  ) {
    this.storageProviders = new Map([
      [StorageType.LOCAL, this.localStorageService],
    ]);
  }

  getStorage(type?: StorageType): FileStorage {
    const storageType = type || this.fileConfigService.getConfig().storage.type;
    const storage = this.storageProviders.get(storageType);

    if (!storage) {
      throw new InvalidStorageTypeException(storageType);
    }

    return storage;
  }
}
