import { Test, TestingModule } from '@nestjs/testing';
import { BaseSeederService } from './base-seeder.service';
import { SeederErrorHandler } from './error-handler.service';
import { SeederFactoryService } from './seeder-factory.service';
import { SeederLogger } from './seeder-logger.service';

describe('SeederFactoryService', () => {
  let service: SeederFactoryService;
  let logger: SeederLogger;
  let errorHandler: SeederErrorHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederFactoryService,
        {
          provide: SeederLogger,
          useValue: {
            setContext: jest.fn(),
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
        {
          provide: SeederErrorHandler,
          useValue: {
            handle: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SeederFactoryService>(SeederFactoryService);
    logger = module.get<SeederLogger>(SeederLogger);
    errorHandler = module.get<SeederErrorHandler>(SeederErrorHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSeederService', () => {
    it('should create BaseSeederService with proper context', () => {
      const context = 'TestContext';
      const result = service.createSeederService(context);

      expect(result).toBeInstanceOf(BaseSeederService);
      expect(logger.setContext).toHaveBeenCalledWith(context);
    });

    it('should create different instances with different contexts', () => {
      const context1 = 'Context1';
      const context2 = 'Context2';

      const result1 = service.createSeederService(context1);
      const result2 = service.createSeederService(context2);

      expect(result1).not.toBe(result2);
      expect(logger.setContext).toHaveBeenCalledWith(context1);
      expect(logger.setContext).toHaveBeenCalledWith(context2);
    });

    it('should share the same logger and error handler instances', () => {
      const context = 'TestContext';
      const result = service.createSeederService(context);

      expect(result['_logger']).toBe(logger);
      expect(result['_errorHandler']).toBe(errorHandler);
    });

    it('should create working BaseSeederService instance', async () => {
      const context = 'TestContext';
      const seeder = service.createSeederService(context);
      const operation = jest.fn().mockResolvedValue('test');

      await seeder.execute(operation);

      expect(operation).toHaveBeenCalled();
    });

    it('should handle errors in created service', async () => {
      const context = 'TestContext';
      const seeder = service.createSeederService(context);
      const error = new Error('Test error');
      const operation = jest.fn().mockRejectedValue(error);

      await expect(seeder.execute(operation)).rejects.toThrow(error);
      expect(errorHandler.handle).toHaveBeenCalledWith(error);
    });
  });
});
