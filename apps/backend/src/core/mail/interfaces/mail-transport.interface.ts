export interface IMailTransport {
  sendMail(options: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }): Promise<void>;
}
