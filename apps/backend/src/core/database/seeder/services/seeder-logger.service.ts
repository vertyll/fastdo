import { Injectable, Logger } from '@nestjs/common';
import { ISeederLogger } from '../interfaces/logger.interface';

@Injectable()
export class SeederLogger implements ISeederLogger {
  private logger: Logger;

  setContext(context: string): void {
    this.logger = new Logger(context);
  }

  log(message: string): void {
    this.logger.log(message);
  }

  error(message: string): void {
    this.logger.error(message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }
}
