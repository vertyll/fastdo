import { MultipartFile } from '@fastify/multipart';
import { Test, TestingModule } from '@nestjs/testing';
import { StorageType } from '../config/types/app.config.type';
import { FileMetadataDto } from './dtos/file-metadata.dto';
import { File } from './entities/file.entity';
import { FileDeleteException } from './exceptions/file-delete.exception';
import { FileNotFoundException } from './exceptions/file-not-found.exception';
import { FileUploadException } from './exceptions/file-upload.exception';
import { FileService } from './file.service';
import { FileStorage } from './interfaces/file-storage.interface';
import { FileRepository } from './repositories/file.repository';
import { StorageStrategy } from './storage/storage-strategy';
import { FileValidator } from './validators/file-validator';

describe('FileService', () => {
  let service: FileService;
  let storageStrategy: jest.Mocked<StorageStrategy>;
  let fileValidator: jest.Mocked<FileValidator>;
  let fileRepository: jest.Mocked<FileRepository>;
  let mockStorage: jest.Mocked<FileStorage>;

  const mockFile: MultipartFile = {
    filename: 'test.jpg',
    mimetype: 'image/jpeg',
    encoding: 'utf-8',
    file: { bytesRead: 1024 },
    toBuffer: jest.fn(),
  } as unknown as MultipartFile;

  const mockUploadedFile: FileMetadataDto = {
    filename: 'test.jpg',
    originalName: 'test.jpg',
    path: '/uploads/test.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    encoding: 'utf-8',
    metadata: {},
    storageType: StorageType.LOCAL,
  };

  const mockSavedFile: File = {
    id: '123',
    filename: 'test.jpg',
    originalName: 'test.jpg',
    path: '/uploads/test.jpg',
    mimetype: 'image/jpeg',
    encoding: 'utf-8',
    size: 1024,
    url: 'http://example.com/test.jpg',
    metadata: {},
    storageType: StorageType.LOCAL,
    dateCreation: new Date(),
    dateModification: new Date(),
    dateDeletion: null,
  };

  beforeEach(async () => {
    mockStorage = {
      uploadFile: jest.fn(),
      getFileUrl: jest.fn(),
      deleteFile: jest.fn(),
    } as jest.Mocked<FileStorage>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: StorageStrategy,
          useValue: {
            getStorage: jest.fn(),
          },
        },
        {
          provide: FileValidator,
          useValue: {
            validate: jest.fn(),
          },
        },
        {
          provide: FileRepository,
          useValue: {
            save: jest.fn(),
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
    storageStrategy = module.get(StorageStrategy);
    fileValidator = module.get(FileValidator);
    fileRepository = module.get(FileRepository);

    storageStrategy.getStorage.mockReturnValue(mockStorage);
  });

  describe('uploadFile', () => {
    it('should successfully upload file', async () => {
      mockStorage.uploadFile.mockResolvedValue(mockUploadedFile);
      mockStorage.getFileUrl.mockResolvedValue(mockSavedFile.url || '');
      fileRepository.save.mockResolvedValue(mockSavedFile);

      const result = await service.uploadFile(mockFile);

      expect(fileValidator.validate).toHaveBeenCalledWith(mockFile, undefined);
      expect(mockStorage.uploadFile).toHaveBeenCalledWith(mockFile, undefined);
      expect(fileRepository.save).toHaveBeenCalledWith({
        ...mockUploadedFile,
        url: mockSavedFile.url,
      });
      expect(result).toEqual({
        ...mockUploadedFile,
        id: mockSavedFile.id,
        url: mockSavedFile.url,
      });
    });

    it('should throw FileUploadException on general error', async () => {
      const error = new Error('Storage error');
      mockStorage.uploadFile.mockRejectedValue(error);

      await expect(service.uploadFile(mockFile))
        .rejects
        .toThrow(new FileUploadException('Failed to process file upload', error));
    });

    it('should propagate FileNotFoundException', async () => {
      const error = new FileNotFoundException('123');
      mockStorage.uploadFile.mockRejectedValue(error);

      await expect(service.uploadFile(mockFile))
        .rejects
        .toThrow(error);
    });
  });

  describe('deleteFile', () => {
    it('should successfully delete file', async () => {
      fileRepository.findById.mockResolvedValue(mockSavedFile);

      await service.deleteFile('123');

      expect(mockStorage.deleteFile).toHaveBeenCalledWith(mockSavedFile.path);
      expect(fileRepository.delete).toHaveBeenCalledWith('123');
    });

    it('should throw FileNotFoundException if file not found', async () => {
      fileRepository.findById.mockResolvedValue(null);

      await expect(service.deleteFile('123'))
        .rejects
        .toThrow(new FileNotFoundException('123'));
    });

    it('should throw FileDeleteException on delete error', async () => {
      const error = new Error('Delete error');
      fileRepository.findById.mockResolvedValue(mockSavedFile);
      mockStorage.deleteFile.mockRejectedValue(error);

      await expect(service.deleteFile('123'))
        .rejects
        .toThrow(new FileDeleteException('Failed to delete file', error));
    });
  });

  describe('getFile', () => {
    it('should return file if found', async () => {
      fileRepository.findById.mockResolvedValue(mockSavedFile);

      const result = await service.getFile('123');

      expect(result).toBe(mockSavedFile);
    });

    it('should throw FileNotFoundException if file not found', async () => {
      fileRepository.findById.mockResolvedValue(null);

      await expect(service.getFile('123'))
        .rejects
        .toThrow(new FileNotFoundException('123'));
    });
  });
});
