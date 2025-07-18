export interface IMailService {
  sendConfirmationEmail(to: string, token: string): Promise<void>;
  sendPasswordResetEmail(to: string, token: string): Promise<void>;
  sendEmailChangeConfirmation(to: string, token: string): Promise<void>;
  sendNotificationEmail(to: string, subject: string, content: string, invitationId?: string): Promise<void>;
}
