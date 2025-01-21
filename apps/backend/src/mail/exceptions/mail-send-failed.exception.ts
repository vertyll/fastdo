import { InternalServerErrorException } from '@nestjs/common';

export class MailSendFailedException extends InternalServerErrorException {
  constructor(message: string) {
    super(`Mail service is not available: ${message}`);
  }
}
