import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { StorageType } from '../../config/types/app.config.type';
import { FileDeleteException } from '../exceptions/file-delete.exception';
import { FileNotFoundException } from '../exceptions/file-not-found.exception';
import { FileUploadException } from '../exceptions/file-upload.exception';
import { FileRepository } from '../repositories/file.repository';
import { StorageStrategy } from '../storage/storage-strategy';
import { FileValidator } from '../validators/file-validator';
import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;
  let mockStorageStrategy: jest.Mocked<StorageStrategy>;
  let mockFileValidator: jest.Mocked<FileValidator>;
  let mockFileRepository: jest.Mocked<FileRepository>;
  let mockI18n: jest.Mocked<I18nService>;
  let mockStorage: any;

  beforeEach(async () => {
    mockStorage = {
      uploadFile: jest.fn(),
      getFileUrl: jest.fn(),
      deleteFile: jest.fn(),
    };

    mockStorageStrategy = {
      getStorage: jest.fn().mockReturnValue(mockStorage),
    } as any;

    mockFileValidator = {
      validate: jest.fn(),
    } as any;

    mockFileRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockI18n = {
      t: jest.fn().mockReturnValue('translated message'),
      translate: jest.fn().mockReturnValue('translated message'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        { provide: StorageStrategy, useValue: mockStorageStrategy },
        { provide: FileValidator, useValue: mockFileValidator },
        { provide: FileRepository, useValue: mockFileRepository },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  describe('uploadFile', () => {
    const mockFile = { filename: 'test.jpg' } as any;
    const mockOptions = { maxSize: 1000 };
    const mockUploadedFile = {
      path: 'path/to/file',
      filename: 'test.jpg',
      originalName: 'test.jpg',
      mimetype: 'image/jpeg',
      encoding: '7bit',
      size: 1000,
      storageType: StorageType.LOCAL,
      origin: 'upload',
      url: 'http://example.com/file',
      metadata: {},
      dateCreation: new Date(),
      dateModification: new Date(),
      dateDeletion: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockSavedFile = { id: '123', ...mockUploadedFile };

    it('should successfully upload a file', async () => {
      mockStorage.uploadFile.mockResolvedValue(mockUploadedFile);
      mockStorage.getFileUrl.mockResolvedValue('http://example.com/file');
      mockFileRepository.save.mockResolvedValue(mockSavedFile);

      const result = await service.uploadFile(mockFile, mockOptions);

      expect(result).toEqual({
        ...mockUploadedFile,
        id: '123',
        url: 'http://example.com/file',
      });
      expect(mockFileValidator.validate).toHaveBeenCalledWith(mockFile, mockOptions);
    });

    it('should throw FileUploadException on general error', async () => {
      mockStorage.uploadFile.mockRejectedValue(new Error('Storage error'));

      await expect(service.uploadFile(mockFile, mockOptions))
        .rejects
        .toThrow(FileUploadException);
    });
  });

  describe('deleteFile', () => {
    const fileId = '123';
    const mockFile = {
      id: fileId,
      path: 'path/to/file',
      filename: 'test.jpg',
      originalName: 'test.jpg',
      mimetype: 'image/jpeg',
      encoding: '7bit',
      size: 1000,
      storageType: StorageType.LOCAL,
      origin: 'upload',
      url: 'http://example.com/file',
      metadata: {},
      dateCreation: new Date(),
      dateModification: new Date(),
      dateDeletion: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully delete a file', async () => {
      mockFileRepository.findById.mockResolvedValue(mockFile);

      await service.deleteFile(fileId);

      expect(mockStorage.deleteFile).toHaveBeenCalledWith(mockFile.path);
      expect(mockFileRepository.delete).toHaveBeenCalledWith(fileId);
    });

    it('should throw FileNotFoundException when file not found', async () => {
      mockFileRepository.findById.mockResolvedValue(null);

      await expect(service.deleteFile(fileId))
        .rejects
        .toThrow(FileNotFoundException);
    });

    it('should throw FileDeleteException on delete error', async () => {
      mockFileRepository.findById.mockResolvedValue(mockFile);
      mockStorage.deleteFile.mockRejectedValue(new Error('Delete error'));

      await expect(service.deleteFile(fileId))
        .rejects
        .toThrow(FileDeleteException);
    });
  });

  describe('getFile', () => {
    const fileId = '123';
    const mockFile = {
      id: fileId,
      path: 'path/to/file',
      filename: 'test.jpg',
      originalName: 'test.jpg',
      mimetype: 'image/jpeg',
      encoding: '7bit',
      size: 1000,
      storageType: StorageType.LOCAL,
      origin: 'upload',
      url: 'http://example.com/file',
      metadata: {},
      dateCreation: new Date(),
      dateModification: new Date(),
      dateDeletion: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully retrieve a file', async () => {
      mockFileRepository.findById.mockResolvedValue(mockFile);

      const result = await service.getFile(fileId);

      expect(result).toEqual(mockFile);
    });

    it('should throw FileNotFoundException when file not found', async () => {
      mockFileRepository.findById.mockResolvedValue(null);

      await expect(service.getFile(fileId))
        .rejects
        .toThrow(FileNotFoundException);
    });
  });
});
