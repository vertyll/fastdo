import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { I18nService } from 'nestjs-i18n';
import { DeleteResult, Repository } from 'typeorm';
import { DurationConfigProvider } from '../../core/providers/duration-config.provider';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { RefreshToken } from '../entities/refresh-token.entity';
import { IRefreshTokenService } from '../interfaces/refresh-token-service.interface';

@Injectable()
export class RefreshTokenService implements IRefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken) private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly durationConfigProvider: DurationConfigProvider,
    private readonly configService: ConfigService,
  ) {}

  public async findMatchingRefreshToken(tokens: RefreshToken[], refreshToken: string): Promise<RefreshToken | null> {
    for (const token of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, token.token);
      if (isMatch) {
        return token;
      }
    }
    return null;
  }

  public async getUserRefreshTokens(userId: number): Promise<RefreshToken[]> {
    return this.refreshTokenRepository.find({
      where: { user: { id: userId } },
    });
  }

  public async validateRefreshToken(userId: number, refreshToken: string): Promise<RefreshToken> {
    const storedTokens: RefreshToken[] = await this.getUserRefreshTokens(userId);
    if (storedTokens.length === 0) {
      throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.invalidToken'));
    }

    const validToken: RefreshToken | null = await this.findMatchingRefreshToken(storedTokens, refreshToken);
    if (!validToken) {
      throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.invalidToken'));
    }

    if (validToken.dateExpiration < new Date()) {
      throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.tokenExpired'));
    }

    return validToken;
  }

  public async saveRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const saltRounds = this.configService.get<number>('app.security.bcryptSaltRounds') ?? 10;
    const refreshTokenHash = await bcrypt.hash(refreshToken, saltRounds);
    const refreshTokenExpiry = this.durationConfigProvider.getExpiryDate(
      'app.security.jwt.refreshToken.expiresIn',
      '7d',
    );

    await this.refreshTokenRepository.save({
      token: refreshTokenHash,
      dateExpiration: refreshTokenExpiry,
      user: { id: userId },
    });
  }

  public async removeToken(token: RefreshToken): Promise<void> {
    await this.refreshTokenRepository.remove(token);
  }

  public async deleteAllUserTokens(userId: number): Promise<void> {
    await this.refreshTokenRepository.delete({ user: { id: userId } });
  }

  public async deleteExpiredTokens(): Promise<number> {
    const result: DeleteResult = await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('dateExpiration < :now', { now: new Date() })
      .execute();
    return result.affected || 0;
  }
}
