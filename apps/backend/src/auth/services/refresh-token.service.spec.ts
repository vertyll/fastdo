import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { DurationConfigProvider } from '../../core/providers/duration-config.provider';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RefreshTokenService } from './refresh-token.service';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let refreshTokenRepository: jest.Mocked<Repository<RefreshToken>>;
  let configService: jest.Mocked<ConfigService>;
  let durationConfigProvider: jest.Mocked<DurationConfigProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              delete: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              execute: jest.fn().mockResolvedValue({ affected: 1 }),
            }),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockImplementation((key: string) => key),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: DurationConfigProvider,
          useValue: {
            getExpiryDate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
    configService = module.get(ConfigService);
    durationConfigProvider = module.get(DurationConfigProvider);
  });

  describe('findMatchingRefreshToken', () => {
    it('should return a matching token', async () => {
      const tokens = [{ token: 'hashed-token' }] as RefreshToken[];
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never);

      const result = await service.findMatchingRefreshToken(tokens, 'plain-token');

      expect(result).toEqual(tokens[0]);
    });

    it('should return null if no matching token is found', async () => {
      const tokens = [{ token: 'hashed-token' }] as RefreshToken[];
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never);

      const result = await service.findMatchingRefreshToken(tokens, 'plain-token');

      expect(result).toBeNull();
    });
  });

  describe('getUserRefreshTokens', () => {
    it('should return user refresh tokens', async () => {
      const tokens = [{ token: 'hashed-token' }] as RefreshToken[];
      refreshTokenRepository.find.mockResolvedValueOnce(tokens);

      const result = await service.getUserRefreshTokens(1);

      expect(result).toEqual(tokens);
      expect(refreshTokenRepository.find).toHaveBeenCalledWith({ where: { user: { id: 1 } } });
    });
  });

  describe('validateRefreshToken', () => {
    it('should throw UnauthorizedException if no tokens are found', async () => {
      refreshTokenRepository.find.mockResolvedValueOnce([]);

      await expect(service.validateRefreshToken(1, 'plain-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if no valid token is found', async () => {
      const tokens = [{ token: 'hashed-token' }] as RefreshToken[];
      refreshTokenRepository.find.mockResolvedValueOnce(tokens);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never);

      await expect(service.validateRefreshToken(1, 'plain-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is expired', async () => {
      const tokens = [{ token: 'hashed-token', dateExpiration: new Date(Date.now() - 10000) }] as RefreshToken[];
      refreshTokenRepository.find.mockResolvedValueOnce(tokens);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never);

      await expect(service.validateRefreshToken(1, 'plain-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should return valid token', async () => {
      const tokens = [{ token: 'hashed-token', dateExpiration: new Date(Date.now() + 10000) }] as RefreshToken[];
      refreshTokenRepository.find.mockResolvedValueOnce(tokens);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never);

      const result = await service.validateRefreshToken(1, 'plain-token');

      expect(result).toEqual(tokens[0]);
    });
  });

  describe('saveRefreshToken', () => {
    it('should save refresh token', async () => {
      const userId = 1;
      const plainToken = 'plain-token';
      const hashedToken = 'hashed-token';
      const expiryDate = new Date(Date.now() + 10000);
      jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce(hashedToken as never);
      configService.get.mockReturnValueOnce(10);
      durationConfigProvider.getExpiryDate.mockReturnValueOnce(expiryDate);

      await service.saveRefreshToken(userId, plainToken);

      expect(refreshTokenRepository.save).toHaveBeenCalledWith({
        token: hashedToken,
        dateExpiration: expiryDate,
        user: { id: userId },
      });
    });
  });

  describe('removeToken', () => {
    it('should remove token', async () => {
      const token = { id: 1 } as RefreshToken;

      await service.removeToken(token);

      expect(refreshTokenRepository.remove).toHaveBeenCalledWith(token);
    });
  });

  describe('deleteAllUserTokens', () => {
    it('should delete all user tokens', async () => {
      const userId = 1;

      await service.deleteAllUserTokens(userId);

      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ user: { id: userId } });
    });
  });

  describe('deleteExpiredTokens', () => {
    it('should delete expired tokens', async () => {
      const result = await service.deleteExpiredTokens();

      expect(result).toBe(1);
      expect(
        refreshTokenRepository.createQueryBuilder().delete().where('dateExpiration < :now', { now: new Date() })
          .execute,
      ).toHaveBeenCalled();
    });
  });
});
