export interface IMailService {
  sendConfirmationEmail(to: string, token: string): Promise<void>;
  sendPasswordResetEmail(to: string, token: string): Promise<void>;
  sendEmailChangeConfirmation(to: string, token: string): Promise<void>;
}
