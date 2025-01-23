import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailConfig } from 'src/core/config/types/app.config.type';

export interface IMailConfig {
  host: string;
  port: number;
  user?: string;
  password?: string;
  from: string;
}

@Injectable()
export class MailConfigService {
  constructor(private configService: ConfigService) {}

  getConfig(): IMailConfig {
    const mailConfig: MailConfig = this.configService.getOrThrow<MailConfig>('app.mail');

    if (!mailConfig.host || !mailConfig.port || !mailConfig.from) {
      throw new Error('Missing required mail configuration');
    }

    return {
      host: mailConfig.host,
      port: mailConfig.port,
      user: mailConfig.user,
      password: mailConfig.password,
      from: mailConfig.from,
    };
  }

  getDevConfig(): IMailConfig {
    const mailConfig: MailConfig = this.configService.getOrThrow<MailConfig>('app.mail');

    if (!mailConfig.from) {
      throw new Error('Missing required mail configuration');
    }

    return {
      host: mailConfig.dev.host,
      port: mailConfig.dev.port,
      from: mailConfig.from,
    };
  }
}
