import { UnauthorizedException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { User } from '../../users/entities/user.entity';
import { AuthService } from '../services/auth.service';
import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;
  let i18nService: jest.Mocked<I18nService<I18nTranslations>>;

  const mockUser: Omit<User, 'password'> = {
    id: 1,
    email: 'test@test.com',
    isActive: true,
    dateCreation: new Date(),
    dateModification: null,
    userRoles: [],
    isEmailConfirmed: true,
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

  beforeEach(() => {
    authService = {
      validateUser: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    i18nService = {
      t: jest.fn().mockReturnValue('translated message'),
    } as unknown as jest.Mocked<I18nService<I18nTranslations>>;

    localStrategy = new LocalStrategy(authService, i18nService);
  });

  it('should validate and return user if credentials are correct', async () => {
    const email = 'test@test.com';
    const password = 'password';

    authService.validateUser.mockResolvedValue(mockUser);

    const result = await localStrategy.validate(email, password);

    expect(authService.validateUser).toHaveBeenCalledWith(email, password);
    expect(result).toEqual(mockUser);
  });

  it('should throw an UnauthorizedException if credentials are invalid', async () => {
    const email = 'test@test.com';
    const password = 'wrong-password';

    authService.validateUser.mockResolvedValue(null);

    await expect(localStrategy.validate(email, password)).rejects.toThrow(UnauthorizedException);
  });
});
