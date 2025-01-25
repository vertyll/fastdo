import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { UsersService } from '../../users/users.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let usersService: jest.Mocked<UsersService>;
  let configService: jest.Mocked<ConfigService>;
  let i18nService: jest.Mocked<I18nService<I18nTranslations>>;

  const mockUser = {
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
  };

  beforeEach(() => {
    usersService = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case 'app.security.jwt.secret':
            return 'test-secret';
          default:
            return null;
        }
      }),
    } as unknown as jest.Mocked<ConfigService>;

    i18nService = {
      t: jest.fn().mockReturnValue('translated message'),
    } as unknown as jest.Mocked<I18nService<I18nTranslations>>;

    jwtStrategy = new JwtStrategy(
      usersService,
      i18nService,
      configService,
    );
  });

  it('should validate and return a user if valid payload is provided', async () => {
    const payload = { sub: 1, roles: ['admin'] };
    usersService.findOne.mockResolvedValue(mockUser);

    const result = await jwtStrategy.validate(payload);

    expect(usersService.findOne).toHaveBeenCalledWith(payload.sub);
    expect(result).toEqual({ ...mockUser, roles: payload.roles });
  });

  it('should throw an UnauthorizedException if user is not found', async () => {
    const payload = { sub: 1, roles: ['admin'] };
    usersService.findOne.mockResolvedValue(null);

    await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw an UnauthorizedException if user is inactive', async () => {
    const payload = { sub: 1, roles: ['admin'] };
    usersService.findOne.mockResolvedValue({
      ...mockUser,
      isActive: false,
    });

    await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });
});
