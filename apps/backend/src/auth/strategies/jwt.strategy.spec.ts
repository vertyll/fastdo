import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { User } from '../../users/entities/user.entity';
import { IUsersService } from '../../users/interfaces/users-service.interface';
import { JwtPayload } from '../types/jwt-payload.interface';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let usersService: jest.Mocked<IUsersService>;
  let configService: jest.Mocked<ConfigService>;
  let i18nService: jest.Mocked<I18nService<I18nTranslations>>;

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
    emailHistories: [],
    projectUserRoles: [],
  };

  const mockPayload: JwtPayload = {
    sub: 1,
    email: 'test@test.com',
    roles: ['user'],
  };

  beforeEach(() => {
    usersService = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<IUsersService>;

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case 'app.security.jwt.accessToken.secret':
            return 'test-secret';
          default:
            return null;
        }
      }),
    } as unknown as jest.Mocked<ConfigService>;

    i18nService = {
      t: jest.fn().mockReturnValue('translated message'),
    } as unknown as jest.Mocked<I18nService<I18nTranslations>>;

    jwtStrategy = new JwtStrategy(usersService, i18nService, configService);
  });

  describe('constructor', () => {
    it('should throw error if JWT_ACCESS_SECRET is not defined', () => {
      configService.get.mockReturnValue(null);

      expect(() => new JwtStrategy(usersService, i18nService, configService)).toThrow(
        'JWT_ACCESS_SECRET is not defined',
      );
    });
  });

  describe('validate', () => {
    it('should validate and return a user if valid payload is provided', async () => {
      usersService.findOne.mockResolvedValue(mockUser);

      const result = await jwtStrategy.validate(mockPayload);

      expect(usersService.findOne).toHaveBeenCalledWith(mockPayload.sub);
      expect(result).toEqual({ ...mockUser, roles: mockPayload.roles });
    });

    it('should throw an UnauthorizedException if user is not found', async () => {
      usersService.findOne.mockResolvedValue(null);

      await expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(UnauthorizedException);
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.invalidToken');
    });

    it('should throw an UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findOne.mockResolvedValue(inactiveUser);

      await expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(UnauthorizedException);
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.invalidToken');
    });

    it('should throw an UnauthorizedException if email is not confirmed', async () => {
      const unconfirmedUser = { ...mockUser, isEmailConfirmed: false };
      usersService.findOne.mockResolvedValue(unconfirmedUser);

      await expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(UnauthorizedException);
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.invalidToken');
    });
  });
});
