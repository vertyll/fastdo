import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { JwtRefreshPayload } from '../interfaces/jwt-refresh-payload.interface';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';

jest.mock('bcrypt');

describe('JwtRefreshStrategy', () => {
  let jwtRefreshStrategy: JwtRefreshStrategy;
  let usersService: jest.Mocked<UsersService>;
  let configService: jest.Mocked<ConfigService>;
  let i18nService: jest.Mocked<I18nService<I18nTranslations>>;

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
    refreshToken: mockHashedRefreshToken,
  };

  const mockPayload: JwtRefreshPayload = {
    sub: 1,
  };

  const mockRequest = {
    body: {
      refreshToken: mockRefreshToken,
    },
  };

  beforeEach(() => {
    usersService = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case 'app.security.jwt.refreshTokenSecret':
            return 'test-refresh-secret';
          default:
            return null;
        }
      }),
    } as unknown as jest.Mocked<ConfigService>;

    i18nService = {
      t: jest.fn().mockReturnValue('translated message'),
    } as unknown as jest.Mocked<I18nService<I18nTranslations>>;

    // Mock bcrypt.compare
    (bcrypt.compare as jest.Mock).mockImplementation((token, hash) =>
      Promise.resolve(token === mockRefreshToken && hash === mockHashedRefreshToken)
    );

    jwtRefreshStrategy = new JwtRefreshStrategy(
      usersService,
      i18nService,
      configService,
    );
  });

  describe('constructor', () => {
    it('should throw error if JWT_REFRESH_SECRET is not defined', () => {
      configService.get.mockReturnValue(null);

      expect(() => new JwtRefreshStrategy(usersService, i18nService, configService))
        .toThrow('JWT_REFRESH_SECRET is not defined');
    });

    it('should create strategy with correct options', () => {
      expect(jwtRefreshStrategy).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should validate and return a user if valid payload and refresh token are provided', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await jwtRefreshStrategy.validate(mockRequest, mockPayload);

      expect(usersService.findOne).toHaveBeenCalledWith(mockPayload.sub);
      expect(bcrypt.compare).toHaveBeenCalledWith(mockRefreshToken, mockUser.refreshToken);
      expect(result).toEqual(mockUser);
    });

    it('should throw an UnauthorizedException if refresh token is not in request body', async () => {
      const requestWithoutToken = { body: {} };

      await expect(jwtRefreshStrategy.validate(requestWithoutToken, mockPayload))
        .rejects.toThrow(UnauthorizedException);
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.invalidToken');
    });

    it('should throw an UnauthorizedException if user is not found', async () => {
      usersService.findOne.mockResolvedValue(null);

      await expect(jwtRefreshStrategy.validate(mockRequest, mockPayload))
        .rejects.toThrow(UnauthorizedException);
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.invalidToken');
    });

    it('should throw an UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findOne.mockResolvedValue(inactiveUser);

      await expect(jwtRefreshStrategy.validate(mockRequest, mockPayload))
        .rejects.toThrow(UnauthorizedException);
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.invalidToken');
    });

    it('should throw an UnauthorizedException if refresh token is not present in user', async () => {
      const userWithoutRefreshToken = { ...mockUser, refreshToken: null };
      usersService.findOne.mockResolvedValue(userWithoutRefreshToken);

      await expect(jwtRefreshStrategy.validate(mockRequest, mockPayload))
        .rejects.toThrow(UnauthorizedException);
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.invalidToken');
    });

    it('should throw an UnauthorizedException if refresh token comparison fails', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(jwtRefreshStrategy.validate(mockRequest, mockPayload))
        .rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalledWith(mockRefreshToken, mockUser.refreshToken);
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.invalidToken');
    });
  });
});
