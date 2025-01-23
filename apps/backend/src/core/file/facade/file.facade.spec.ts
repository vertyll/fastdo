import { MultipartFile } from '@fastify/multipart';
import { Test, TestingModule } from '@nestjs/testing';
import { StorageType } from '../../config/types/app.config.type';
import { FileMetadataDto } from '../dtos/file-metadata.dto';
import { File } from '../entities/file.entity';
import { FileService } from '../file.service';
import { FileFacade } from './file.facade';

describe('FileFacade', () => {
  let facade: FileFacade;
  let fileService: jest.Mocked<FileService>;

  const mockFile = {
    filename: 'test.jpg',
    mimetype: 'image/jpeg',
  } as MultipartFile;

  const mockMetadata: FileMetadataDto = {
    id: '123',
    filename: 'test.jpg',
    originalName: 'test.jpg',
    path: '/uploads/test.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    encoding: 'utf-8',
    metadata: {},
    storageType: StorageType.LOCAL,
    url: 'http://example.com/test.jpg',
  };

  const mockFileEntity: File = {
    id: '123',
    ...mockMetadata,
    url: mockMetadata.url ?? null,
    metadata: {},
    dateCreation: new Date(),
    dateModification: new Date(),
    dateDeletion: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileFacade,
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

    facade = module.get(FileFacade);
    fileService = module.get(FileService);
  });

  describe('upload', () => {
    it('should call fileService.uploadFile with correct params', async () => {
      const options = { maxSize: 1024 };
      fileService.uploadFile.mockResolvedValue(mockMetadata);

      const result = await facade.upload(mockFile, options);

      expect(fileService.uploadFile).toHaveBeenCalledWith(mockFile, options);
      expect(result).toBe(mockMetadata);
    });
  });

  describe('delete', () => {
    it('should call fileService.deleteFile with correct id', async () => {
      await facade.delete('123');
      expect(fileService.deleteFile).toHaveBeenCalledWith('123');
    });
  });

  describe('get', () => {
    it('should call fileService.getFile with correct id', async () => {
      fileService.getFile.mockResolvedValue(mockFileEntity);

      const result = await facade.get('123');

      expect(fileService.getFile).toHaveBeenCalledWith('123');
      expect(result).toBe(mockFileEntity);
    });
  });
});
