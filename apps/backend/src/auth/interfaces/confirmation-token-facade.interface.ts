export interface IConfirmationTokenFacade {
  generateToken(email: string): string;
}
