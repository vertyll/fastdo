import { SeederErrorHandler } from './error-handler.service';
import { SeederLogger } from './seeder-logger.service';

export class BaseSeederService {
  constructor(
    private readonly logger: SeederLogger,
    private readonly errorHandler: SeederErrorHandler,
  ) {}

  public getLogger(): SeederLogger {
    return this.logger;
  }

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      await this.errorHandler.handle(error);
      throw error;
    }
  }
}
