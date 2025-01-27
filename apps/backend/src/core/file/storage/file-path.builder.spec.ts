import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import { FilePathBuilder } from './file-path.builder';

jest.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

describe('FilePathBuilder', () => {
  let builder: FilePathBuilder;
  const mockDate = new Date('2024-01-23T12:00:00Z');

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilePathBuilder,
      ],
    }).compile();

    builder = module.get(FilePathBuilder);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('buildPath', () => {
    it('should build path with custom path', () => {
      const path = builder.buildPath('test.jpg', 'custom/path');
      expect(path).toBe(join('custom/path', 'mock-uuid-test.jpg'));
    });

    it('should build path with date-based structure', () => {
      const path = builder.buildPath('test.jpg');
      expect(path).toBe(join('2024', '01', '23', 'mock-uuid-test.jpg'));
    });

    it('should sanitize filename', () => {
      const path = builder.buildPath('Test File@#$.jpg');
      expect(path).toBe(join('2024', '01', '23', 'mock-uuid-test-file-.jpg'));
    });

    it('should handle multiple dashes', () => {
      const path = builder.buildPath('test---file.jpg');
      expect(path).toBe(join('2024', '01', '23', 'mock-uuid-test-file.jpg'));
    });
  });
});
