import { Injectable, Logger } from '@nestjs/common';
import { ISeederLogger } from '../interfaces/logger.interface';

@Injectable()
export class SeederLogger implements ISeederLogger {
  private logger: Logger;

  public setContext(context: string): void {
    this.logger = new Logger(context);
  }

  public log(message: string): void {
    this.logger.log(message);
  }

  public error(message: string): void {
    this.logger.error(message);
  }

  public warn(message: string): void {
    this.logger.warn(message);
  }
}
