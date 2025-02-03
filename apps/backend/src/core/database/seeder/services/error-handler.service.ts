import { Injectable } from '@nestjs/common';
import { ISeederErrorHandler } from '../interfaces/error-handler.interface';
import { SeederLogger } from './seeder-logger.service';

@Injectable()
export class SeederErrorHandler implements ISeederErrorHandler {
  constructor(private readonly logger: SeederLogger) {}

  public async handle(error: Error): Promise<void> {
    this.logger.error(`Seeding failed: ${error.message}`);
    throw error;
  }
}
