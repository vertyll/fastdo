export interface IConfirmationTokenService {
  generateToken(email: string): string;
  verifyToken(token: string): { email: string; };
}
