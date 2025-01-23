import { MultipartFile } from '@fastify/multipart';
import { Test, TestingModule } from '@nestjs/testing';
import { StorageType } from '../config/types/app.config.type';
import { FileMetadataDto } from './dtos/file-metadata.dto';
import { File } from './entities/file.entity';
import { FileController } from './file.controller';
import { FileService } from './file.service';

describe('FileController', () => {
  let controller: FileController;
  let fileService: jest.Mocked<FileService>;

  const mockFile: MultipartFile = {
    filename: 'test.jpg',
    mimetype: 'image/jpeg',
    encoding: 'utf-8',
    file: { bytesRead: 1024 },
    toBuffer: jest.fn(),
  } as unknown as MultipartFile;

  const mockFileMetadata: FileMetadataDto = {
    id: '123',
    filename: 'test.jpg',
    originalName: 'test.jpg',
    path: '/uploads/test.jpg',
    url: 'http://example.com/test.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    encoding: 'utf-8',
    metadata: {},
    storageType: StorageType.LOCAL,
  };

  const mockFileData: File = {
    id: '123',
    filename: 'test.jpg',
    originalName: 'test.jpg',
    path: '/uploads/test.jpg',
    url: 'http://example.com/test.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    encoding: 'utf-8',
    metadata: {},
    storageType: StorageType.LOCAL,
    dateCreation: new Date(),
    dateModification: new Date(),
    dateDeletion: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FileService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
            getFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FileController>(FileController);
    fileService = module.get(FileService);
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      fileService.uploadFile.mockResolvedValue(mockFileMetadata);

      const result = await controller.uploadFile(mockFile);

      expect(fileService.uploadFile).toHaveBeenCalledWith(mockFile, undefined);
      expect(result).toBe(mockFileMetadata);
    });

    it('should upload file with options', async () => {
      const options = { maxSize: 1024 };
      fileService.uploadFile.mockResolvedValue(mockFileMetadata);

      const result = await controller.uploadFile(mockFile, options);

      expect(fileService.uploadFile).toHaveBeenCalledWith(mockFile, options);
      expect(result).toBe(mockFileMetadata);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      await controller.deleteFile('123');

      expect(fileService.deleteFile).toHaveBeenCalledWith('123');
    });
  });

  describe('getFile', () => {
    it('should get file successfully', async () => {
      fileService.getFile.mockResolvedValue(mockFileData);

      const result = await controller.getFile('123');

      expect(fileService.getFile).toHaveBeenCalledWith('123');
      expect(result).toBe(mockFileData);
    });
  });
});
