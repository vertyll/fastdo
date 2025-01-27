import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import { FILE_CONSTANTS, StorageType } from '../../config/types/app.config.type';
import { FileConfigService } from './file-config';

describe('FileConfigService', () => {
  let service: FileConfigService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileConfigService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn() as jest.MockInstance<any, [string, any?, any?]>,
            getOrThrow: jest.fn() as jest.MockInstance<any, [string, any?, any?]>,
          },
        },
      ],
    }).compile();

    service = module.get<FileConfigService>(FileConfigService);
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
  });

  describe('getConfig', () => {
    it('should return the correct configuration', () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'app.file.storage.type':
            return StorageType.LOCAL;
          case 'app.file.validation.maxSize':
            return '1048576';
          case 'app.file.validation.allowedMimeTypes':
            return 'image/jpeg,image/png';
          default:
            return null;
        }
      });
      configService.getOrThrow.mockReturnValue('uploads');

      const config = service.getConfig();

      expect(config).toEqual({
        storage: {
          type: StorageType.LOCAL,
          local: {
            uploadDirPath: join(process.cwd(), 'uploads'),
          },
        },
        validation: {
          maxSize: 1048576,
          allowedMimeTypes: ['image/jpeg', 'image/png'],
        },
      });
    });
  });

  describe('getStorageType', () => {
    it('should return the correct storage type', () => {
      configService.get.mockReturnValue(StorageType.LOCAL);
      expect(service['getStorageType']()).toBe(StorageType.LOCAL);
    });

    it('should return the default storage type if not set', () => {
      configService.get.mockReturnValue(undefined);
      expect(service['getStorageType']()).toBe(StorageType.LOCAL);
    });
  });

  describe('getLocalConfig', () => {
    it('should return the correct local config', () => {
      configService.getOrThrow.mockReturnValue('uploads');
      const localConfig = service['getLocalConfig']();
      expect(localConfig).toEqual({
        uploadDirPath: join(process.cwd(), 'uploads'),
      });
    });
  });

  describe('getMaxFileSize', () => {
    it('should return the correct max file size when set as a number', () => {
      configService.get.mockReturnValue(1048576);
      expect(service['getMaxFileSize']()).toBe(1048576);
    });

    it('should return the correct max file size when set as a string', () => {
      configService.get.mockReturnValue('1048576');
      expect(service['getMaxFileSize']()).toBe(1048576);
    });

    it('should return the default max file size if not set', () => {
      configService.get.mockReturnValue(undefined);
      expect(service['getMaxFileSize']()).toBe(FILE_CONSTANTS.MAX_FILE_SIZE);
    });
  });

  describe('getAllowedMimeTypes', () => {
    it('should return the correct allowed mime types when set as an array', () => {
      configService.get.mockReturnValue(['image/jpeg', 'image/png']);
      expect(service['getAllowedMimeTypes']()).toEqual(['image/jpeg', 'image/png']);
    });

    it('should return the correct allowed mime types when set as a string', () => {
      configService.get.mockReturnValue('image/jpeg,image/png');
      expect(service['getAllowedMimeTypes']()).toEqual(['image/jpeg', 'image/png']);
    });

    it('should return the default allowed mime types if not set', () => {
      configService.get.mockReturnValue(undefined);
      expect(service['getAllowedMimeTypes']()).toEqual(FILE_CONSTANTS.ALLOWED_MIME_TYPES);
    });
  });
});
