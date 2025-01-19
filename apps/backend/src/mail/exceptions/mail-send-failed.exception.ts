import { InternalServerErrorException } from '@nestjs/common';

export class MailSendFailedException extends InternalServerErrorException {
  constructor(message: string) {
    super(
      process.env.NODE_ENV === 'development'
        ? `Mail service is not available: ${message}. Make sure MailDev is running.`
        : 'Unable to send email. Please try again later.',
    );
  }
}
