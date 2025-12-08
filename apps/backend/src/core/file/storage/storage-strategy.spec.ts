import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { StorageType } from '../../config/types/app.config.type';
import { FileConfigService } from '../config/file-config';
import { InvalidStorageTypeException } from '../exceptions/invalid-storage-type.exception';
import { LocalStorageService } from './providers/local-storage.service';
import { StorageStrategy } from './storage-strategy';

describe('StorageStrategy', () => {
  let strategy: StorageStrategy;
  let localStorageService: jest.Mocked<LocalStorageService>;

  const mockConfig = {
    storage: {
      type: StorageType.LOCAL,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageStrategy,
        {
          provide: LocalStorageService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
            getFileUrl: jest.fn(),
          },
        },
        {
          provide: FileConfigService,
          useValue: {
            getConfig: jest.fn().mockReturnValue(mockConfig),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockReturnValue('translated message'),
            translate: jest.fn().mockReturnValue('translated message'),
          },
        },
      ],
    }).compile();

    strategy = module.get<StorageStrategy>(StorageStrategy);
    localStorageService = module.get(LocalStorageService);
  });

  describe('getStorage', () => {
    it('should return local storage service when type is LOCAL', () => {
      const storage = strategy.getStorage(StorageType.LOCAL);
      expect(storage).toBe(localStorageService);
    });

    it('should return default storage type from config when no type provided', () => {
      const storage = strategy.getStorage();
      expect(storage).toBe(localStorageService);
    });

    it('should throw InvalidStorageTypeException for invalid storage type', () => {
      const invalidType = 's3' as StorageType;
      expect(() => strategy.getStorage(invalidType)).toThrow(InvalidStorageTypeException);
    });
  });
});
