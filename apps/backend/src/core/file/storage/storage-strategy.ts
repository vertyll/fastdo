import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n/i18n.generated';
import { StorageTypeEnum } from '../../config/types/app.config.type';
import { FileConfigService } from '../config/file-config';
import { InvalidStorageTypeException } from '../exceptions/invalid-storage-type.exception';
import { FileStorage } from '../interfaces/file-storage.interface';
import { LocalStorageService } from './providers/local-storage.service';

@Injectable()
export class StorageStrategy {
  private readonly storageProviders: Map<StorageTypeEnum, FileStorage>;
  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly fileConfigService: FileConfigService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {
    this.storageProviders = new Map([[StorageTypeEnum.LOCAL, this.localStorageService]]);
  }

  public getStorage(type?: StorageTypeEnum): FileStorage {
    const storageType = type || this.fileConfigService.getConfig().storage.type;
    const storage = this.storageProviders.get(storageType);

    if (!storage) throw new InvalidStorageTypeException(this.i18n, storageType);

    return storage;
  }
}
