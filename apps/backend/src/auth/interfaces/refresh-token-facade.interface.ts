export interface IRefreshTokenFacade {
  deleteAllUserTokens(userId: number): Promise<void>;
}
