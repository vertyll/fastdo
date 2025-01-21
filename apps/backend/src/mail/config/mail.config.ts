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
    const mailConfig = this.configService.get('app.mail');

    if (!mailConfig.host || !mailConfig.port || !mailConfig.from || !mailConfig.appUrl) {
      throw new Error('Missing required mail configuration');
    }

    return {
      host: mailConfig.host,
      port: mailConfig.port,
      user: mailConfig.user,
      password: mailConfig.password,
      from: mailConfig.from,
      appUrl: mailConfig.appUrl,
    };
  }

  getDevConfig(): IMailConfig {
    const mailConfig = this.configService.get('app.mail');

    if (!mailConfig.from || !mailConfig.appUrl) {
      throw new Error('Missing required mail configuration');
    }

    return {
      host: mailConfig.dev.host,
      port: mailConfig.dev.port,
      from: mailConfig.from,
      appUrl: mailConfig.appUrl,
    };
  }
}
