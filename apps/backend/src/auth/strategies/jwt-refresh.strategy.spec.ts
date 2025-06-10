import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { User } from '../../users/entities/user.entity';
import { IUsersService } from '../../users/interfaces/users-service.interface';
import { RefreshToken } from '../entities/refresh-token.entity';
import { IRefreshTokenService } from '../interfaces/refresh-token-service.interface';
import { JwtRefreshPayload } from '../types/jwt-refresh-payload.interface';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';

describe('JwtRefreshStrategy', () => {
  let jwtRefreshStrategy: JwtRefreshStrategy;
  let usersService: jest.Mocked<IUsersService>;
  let configService: jest.Mocked<ConfigService>;
  let i18nService: jest.Mocked<I18nService<I18nTranslations>>;
  let refreshTokenService: jest.Mocked<IRefreshTokenService>;

  const mockRefreshToken = 'test-refresh-token';

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
    emailHistories: [],
  };

  const mockRefreshTokenEntity: RefreshToken = {
    id: 1,
    token: 'hashedToken',
    expiresAt: new Date(Date.now() + 10000),
    user: mockUser,
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
    } as unknown as jest.Mocked<IUsersService>;

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
      translate: jest.fn(),
      onModuleDestroy: jest.fn(),
      getSupportedLanguages: jest.fn(),
      validate: jest.fn(),
    } as unknown as jest.Mocked<I18nService<I18nTranslations>>;

    refreshTokenService = {
      validateRefreshToken: jest.fn(),
    } as unknown as jest.Mocked<IRefreshTokenService>;

    jwtRefreshStrategy = new JwtRefreshStrategy(
      usersService,
      i18nService,
      refreshTokenService,
      configService,
    );
  });

  describe('validate', () => {
    it('should validate and return a user if valid payload and refresh token are provided', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      refreshTokenService.validateRefreshToken.mockResolvedValue(mockRefreshTokenEntity);

      const result = await jwtRefreshStrategy.validate(mockRequest, mockPayload);

      expect(usersService.findOne).toHaveBeenCalledWith(mockPayload.sub);
      expect(refreshTokenService.validateRefreshToken).toHaveBeenCalledWith(mockUser.id, mockRefreshToken);
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

    it('should throw UnauthorizedException if refresh token validation fails', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      refreshTokenService.validateRefreshToken.mockRejectedValue(
        new UnauthorizedException('messages.Auth.errors.invalidToken'),
      );

      await expect(jwtRefreshStrategy.validate(mockRequest, mockPayload))
        .rejects.toThrow(UnauthorizedException);
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
