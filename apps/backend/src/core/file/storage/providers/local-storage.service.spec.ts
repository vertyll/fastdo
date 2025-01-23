import { MultipartFile } from '@fastify/multipart';
import { Test, TestingModule } from '@nestjs/testing';
import { ensureDir, unlink, writeFile } from 'fs-extra';
import { join } from 'path';
import { StorageType } from '../../../config/types/app.config.type';
import { FileConfigService } from '../../config/file-config';
import { FileDeleteException } from '../../exceptions/file-delete.exception';
import { FileNotFoundException } from '../../exceptions/file-not-found.exception';
import { FileUploadException } from '../../exceptions/file-upload.exception';
import { FilePathBuilder } from '../file-path.builder';
import { LocalStorageService } from './local-storage.service';

jest.mock('fs-extra');
jest.mock('path');

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  let fileConfigService: jest.Mocked<FileConfigService>;
  let filePathBuilder: jest.Mocked<FilePathBuilder>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStorageService,
        {
          provide: FileConfigService,
          useValue: {
            getConfig: jest.fn(),
          },
        },
        {
          provide: FilePathBuilder,
          useValue: {
            buildPath: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LocalStorageService>(LocalStorageService);
    fileConfigService = module.get<FileConfigService>(FileConfigService) as jest.Mocked<FileConfigService>;
    filePathBuilder = module.get<FilePathBuilder>(FilePathBuilder) as jest.Mocked<FilePathBuilder>;

    fileConfigService.getConfig.mockReturnValue({
      storage: {
        type: StorageType.LOCAL,
        local: {
          uploadDirPath: '/uploads',
        },
      },
      validation: {
        maxSize: 1048576,
        allowedMimeTypes: ['image/jpeg', 'image/png'],
      },
    });

    (join as jest.Mock).mockImplementation((...args) => args.join('/'));
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const mockFile: MultipartFile = {
        filename: 'test.txt',
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('test content')),
        mimetype: 'text/plain',
        encoding: 'utf-8',
      } as any;

      filePathBuilder.buildPath.mockReturnValue('test/test.txt');

      await expect(service.uploadFile(mockFile)).resolves.toEqual({
        filename: 'test.txt',
        originalName: 'test.txt',
        path: 'test/test.txt',
        mimetype: 'text/plain',
        size: Buffer.from('test content').length,
        encoding: 'utf-8',
        metadata: {},
        storageType: StorageType.LOCAL,
      });

      expect(ensureDir).toHaveBeenCalledWith('/uploads/test');
      expect(writeFile).toHaveBeenCalledWith('/uploads/test/test.txt', Buffer.from('test content'));
    });

    it('should throw FileUploadException on error', async () => {
      const mockFile: MultipartFile = {
        filename: 'test.txt',
        toBuffer: jest.fn().mockRejectedValue(new Error('Failed to read file')),
      } as any;

      await expect(service.uploadFile(mockFile)).rejects.toThrow(FileUploadException);
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      await expect(service.deleteFile('test/test.txt')).resolves.toBeUndefined();
      expect(unlink as unknown as jest.Mock).toHaveBeenCalledWith('/uploads/test/test.txt');
    });

    it('should throw FileNotFoundException if file does not exist', async () => {
      const enoentError = new Error('ENOENT: no such file or directory') as NodeJS.ErrnoException;
      enoentError.code = 'ENOENT';
      (unlink as unknown as jest.Mock).mockRejectedValue(enoentError);

      await expect(service.deleteFile('test/test.txt')).rejects.toThrow(FileNotFoundException);
    });

    it('should throw FileDeleteException on error', async () => {
      (unlink as unknown as jest.Mock).mockRejectedValue(new Error('Failed to delete file'));

      await expect(service.deleteFile('test/test.txt')).rejects.toThrow(FileDeleteException);
    });
  });

  describe('getFileUrl', () => {
    it('should return the correct file URL', async () => {
      await expect(service.getFileUrl('test/test.txt')).resolves.toBe('/uploads/test/test.txt');
    });
  });
});
