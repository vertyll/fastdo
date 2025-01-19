import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface IMailConfig {
  host: string;
  port: number;
  user?: string;
  password?: string;
  from: string;
  appUrl: string;
}

@Injectable()
export class MailConfigService {
  constructor(private configService: ConfigService) {}

  getConfig(): IMailConfig {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT');
    const from = this.configService.get<string>('MAIL_FROM');
    const appUrl = this.configService.get<string>('APP_URL');

    if (!host || !port || !from || !appUrl) {
      throw new Error('Missing required mail configuration');
    }

    return {
      host,
      port,
      user: this.configService.get('MAIL_USER'),
      password: this.configService.get('MAIL_PASS'),
      from,
      appUrl,
    };
  }

  getDevConfig(): IMailConfig {
    const from = this.configService.get<string>('MAIL_FROM');
    const appUrl = this.configService.get<string>('APP_URL');

    if (!from || !appUrl) {
      throw new Error('Missing required mail configuration');
    }

    return {
      host: 'localhost',
      port: 1025,
      from,
      appUrl,
    };
  }
}
