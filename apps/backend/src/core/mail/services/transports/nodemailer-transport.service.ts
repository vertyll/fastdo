import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailConfigService } from '../../config/mail.config';
import { IMailTransport } from '../../interfaces/mail-transport.interface';

@Injectable()
export class NodemailerTransport implements IMailTransport {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly mailConfig: MailConfigService) {
    const config = this.mailConfig.getConfig();
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
  }

  public async sendMail(options: { from: string; to: string; subject: string; html: string }): Promise<void> {
    await this.transporter.sendMail(options);
  }
}
