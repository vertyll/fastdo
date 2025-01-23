import { MultipartFile } from '@fastify/multipart';
import { Test, TestingModule } from '@nestjs/testing';
import { FileConfigService } from '../config/file-config';
import { FileValidationException } from '../exceptions/file-validation.exception';
import { FileUploadOptions } from '../interfaces/file-upload-options.interface';
import { FileValidator } from './file-validator';

describe('FileValidator', () => {
  let validator: FileValidator;

  const mockConfig = {
    validation: {
      maxSize: 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png'],
    },
  };

  const mockFile = {
    filename: 'test.jpg',
    mimetype: 'image/jpeg',
    encoding: 'utf-8',
    type: 'file',
    file: {
      bytesRead: 500,
    },
  } as unknown as MultipartFile;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileValidator,
        {
          provide: FileConfigService,
          useValue: {
            getConfig: jest.fn().mockReturnValue(mockConfig),
          },
        },
      ],
    }).compile();

    validator = module.get<FileValidator>(FileValidator);
  });

  describe('validate', () => {
    it('should pass validation for valid file', async () => {
      await expect(validator.validate(mockFile)).resolves.not.toThrow();
    });

    it('should throw when file size exceeds limit', async () => {
      const largeFile = {
        ...mockFile,
        file: { bytesRead: 2048 },
      } as unknown as MultipartFile;

      await expect(validator.validate(largeFile))
        .rejects
        .toThrow(FileValidationException);
    });

    it('should throw for invalid mime type', async () => {
      const invalidFile = {
        ...mockFile,
        mimetype: 'text/plain',
      } as unknown as MultipartFile;

      await expect(validator.validate(invalidFile))
        .rejects
        .toThrow(FileValidationException);
    });

    it('should use custom options when provided', async () => {
      const options: FileUploadOptions = {
        maxSize: 2048,
        allowedMimeTypes: ['text/plain'],
      };

      const customFile = {
        ...mockFile,
        mimetype: 'text/plain',
        file: { bytesRead: 1500 },
      } as unknown as MultipartFile;

      await expect(validator.validate(customFile, options))
        .resolves
        .not
        .toThrow();
    });
  });
});
