import { Injectable } from '@nestjs/common';
import { BaseSeederService } from './base-seeder.service';
import { SeederErrorHandler } from './error-handler.service';
import { SeederLogger } from './seeder-logger.service';

@Injectable()
export class SeederFactoryService {
  constructor(
    private readonly logger: SeederLogger,
    private readonly errorHandler: SeederErrorHandler,
  ) {}

  createSeederService(context: string): BaseSeederService {
    this.logger.setContext(context);
    return new BaseSeederService(this.logger, this.errorHandler);
  }
}
