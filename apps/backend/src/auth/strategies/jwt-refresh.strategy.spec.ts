import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { FastifyRequest } from 'fastify';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import { JwtRefreshPayload } from '../interfaces/jwt-refresh-payload.interface';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';

jest.mock('bcrypt');

describe('JwtRefreshStrategy', () => {
  let jwtRefreshStrategy: JwtRefreshStrategy;
  let usersService: jest.Mocked<UsersService>;
  let configService: jest.Mocked<ConfigService>;
  let i18nService: jest.Mocked<I18nService<I18nTranslations>>;
  let refreshTokenRepository: jest.Mocked<Repository<RefreshToken>>;

  const mockRefreshToken = 'test-refresh-token';
  const mockHashedRefreshToken = 'hashed-refresh-token';

  const mockUser: User = {
    id: 1,
    email: 'test@test.com',
    isActive: true,
    isEmailConfirmed: true,
    password: 'hashedPassword',
    dateCreation: new Date(),
    dateModification: null,
    userRoles: [],
    confirmationToken: 'token',
    confirmationTokenExpiry: new Date(),
    termsAccepted: true,
    privacyPolicyAccepted: true,
    dateTermsAcceptance: new Date(),
    datePrivacyPolicyAcceptance: new Date(),
    avatar: null,
    emailChangeToken: null,
    emailChangeTokenExpiry: null,
    pendingEmail: null,
    refreshTokens: [],
    projectUsers: [],
  };

  const mockPayload: JwtRefreshPayload = {
    sub: 1,
  };

  const mockRequest = {
    cookies: {
      refresh_token: mockRefreshToken,
    },
  } as Partial<FastifyRequest> as FastifyRequest;

  beforeEach(() => {
    usersService = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case 'app.security.jwt.refreshToken.secret':
            return 'test-refresh-secret';
          default:
            return null;
        }
      }),
    } as unknown as jest.Mocked<ConfigService>;

    i18nService = {
      t: jest.fn().mockReturnValue('translated message'),
    } as unknown as jest.Mocked<I18nService<I18nTranslations>>;

    refreshTokenRepository = {
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<RefreshToken>>;

    (bcrypt.compare as jest.Mock).mockImplementation((token, hash) =>
      Promise.resolve(token === mockRefreshToken && hash === mockHashedRefreshToken)
    );

    jwtRefreshStrategy = new JwtRefreshStrategy(
      usersService,
      i18nService,
      configService,
      refreshTokenRepository,
    );
  });

  describe('validate', () => {
    it('should validate and return a user if valid payload and refresh token are provided', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      refreshTokenRepository.find.mockResolvedValue([{
        token: mockHashedRefreshToken,
        expiresAt: new Date(Date.now() + 10000),
        user: mockUser,
      } as RefreshToken]);

      const result = await jwtRefreshStrategy.validate(mockRequest, mockPayload);

      expect(usersService.findOne).toHaveBeenCalledWith(mockPayload.sub);
      expect(refreshTokenRepository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(mockRefreshToken, mockHashedRefreshToken);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      usersService.findOne.mockResolvedValue(null);

      await expect(jwtRefreshStrategy.validate(mockRequest, mockPayload))
        .rejects.toThrow(UnauthorizedException);
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.invalidToken');
    });

    it('should throw UnauthorizedException if user is not active', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findOne.mockResolvedValue(inactiveUser);

      await expect(jwtRefreshStrategy.validate(mockRequest, mockPayload))
        .rejects.toThrow(UnauthorizedException);
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.invalidToken');
    });

    it('should throw UnauthorizedException if email is not confirmed', async () => {
      const unconfirmedUser = { ...mockUser, isEmailConfirmed: false };
      usersService.findOne.mockResolvedValue(unconfirmedUser);

      await expect(jwtRefreshStrategy.validate(mockRequest, mockPayload))
        .rejects.toThrow(UnauthorizedException);
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.invalidToken');
    });

    it('should throw UnauthorizedException if no tokens are found', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      refreshTokenRepository.find.mockResolvedValue([]);

      await expect(jwtRefreshStrategy.validate(mockRequest, mockPayload))
        .rejects.toThrow(UnauthorizedException);
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.invalidToken');
    });

    it('should throw UnauthorizedException if token has expired', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      refreshTokenRepository.find.mockResolvedValue([{
        token: mockHashedRefreshToken,
        expiresAt: new Date(Date.now() - 10000), // expired token
        user: mockUser,
      } as RefreshToken]);

      await expect(jwtRefreshStrategy.validate(mockRequest, mockPayload))
        .rejects.toThrow(UnauthorizedException);
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.tokenExpired');
    });

    it('should throw UnauthorizedException if no valid token is found', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      refreshTokenRepository.find.mockResolvedValue([{
        token: 'different-hash',
        expiresAt: new Date(Date.now() + 10000),
        user: mockUser,
      } as RefreshToken]);

      (bcrypt.compare as jest.Mock).mockImplementation(() => Promise.resolve(false));

      await expect(jwtRefreshStrategy.validate(mockRequest, mockPayload))
        .rejects.toThrow(UnauthorizedException);
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.invalidToken');
    });

    it('should throw UnauthorizedException if refresh token is missing', async () => {
      const requestWithoutToken = {
        cookies: {},
      } as Partial<FastifyRequest> as FastifyRequest;

      await expect(jwtRefreshStrategy.validate(requestWithoutToken, mockPayload))
        .rejects.toThrow(UnauthorizedException);
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.invalidToken');
    });
  });
});
