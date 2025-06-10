import { RefreshToken } from '../entities/refresh-token.entity';

export interface IRefreshTokenService {
  findMatchingRefreshToken(tokens: RefreshToken[], refreshToken: string): Promise<RefreshToken | null>;
  getUserRefreshTokens(userId: number): Promise<RefreshToken[]>;
  validateRefreshToken(userId: number, refreshToken: string): Promise<RefreshToken>;
  saveRefreshToken(userId: number, refreshToken: string): Promise<void>;
  removeToken(token: RefreshToken): Promise<void>;
  deleteAllUserTokens(userId: number): Promise<void>;
  deleteExpiredTokens(): Promise<number>;
}
