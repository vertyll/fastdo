import { Test, TestingModule } from '@nestjs/testing';
import { SeederErrorHandler } from './error-handler.service';
import { SeederLogger } from './seeder-logger.service';

describe('SeederErrorHandler', () => {
  let service: SeederErrorHandler;
  let logger: SeederLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederErrorHandler,
        {
          provide: SeederLogger,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SeederErrorHandler>(SeederErrorHandler);
    logger = module.get<SeederLogger>(SeederLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    it('should log error message and rethrow error', async () => {
      const error = new Error('Test error');

      await expect(service.handle(error)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith('Seeding failed: Test error');
    });

    it('should handle error with empty message', async () => {
      const error = new Error(); // NOSONAR

      await expect(service.handle(error)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith('Seeding failed: ');
    });

    it('should handle custom error types', async () => {
      class CustomError extends Error {
        constructor() {
          super('Custom error');
          this.name = 'CustomError';
        }
      }
      const error = new CustomError();

      await expect(service.handle(error)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith('Seeding failed: Custom error');
    });

    it('should preserve error stack trace', async () => {
      const error = new Error('Test error');
      const originalStack = error.stack;

      try {
        await service.handle(error);
      } catch (e) {
        expect(e.stack).toBe(originalStack);
      }
    });

    it('should not modify original error', async () => {
      const error = new Error('Test error');
      const originalMessage = error.message;
      const originalName = error.name;

      try {
        await service.handle(error);
      } catch (e) {
        expect(e.message).toBe(originalMessage);
        expect(e.name).toBe(originalName);
      }
    });
  });
});
