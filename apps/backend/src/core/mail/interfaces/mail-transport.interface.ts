import { MailTransportOptions } from '../types/mail-transport-options.interface';

export interface IMailTransport {
  sendMail(options: MailTransportOptions): Promise<void>;
}
