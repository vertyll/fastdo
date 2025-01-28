import { SeederErrorHandler } from './error-handler.service';
import { SeederLogger } from './seeder-logger.service';

export class BaseSeederService {
  constructor(
    private readonly _logger: SeederLogger,
    private readonly _errorHandler: SeederErrorHandler,
  ) {}

  public getLogger(): SeederLogger {
    return this._logger;
  }

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      await this._errorHandler.handle(error);
      throw error;
    }
  }
}
