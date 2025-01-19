import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let authService: Partial<AuthService>;

  beforeEach(() => {
    authService = {
      validateUser: jest.fn(),
    };

    localStrategy = new LocalStrategy(authService as AuthService);
  });

  it('should validate and return user if credentials are correct', async () => {
    const email = 'test@test.com';
    const password = 'password';
    const mockUser = {
      id: 1,
      email,
      isActive: true,
      dateCreation: new Date(),
      dateModification: null,
      userRoles: [],
      isEmailConfirmed: true,
      confirmationToken: 'token',
      confirmationTokenExpiry: new Date(),
    };

    jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);

    const result = await localStrategy.validate(email, password);

    expect(authService.validateUser).toHaveBeenCalledWith(email, password);
    expect(result).toEqual(mockUser);
  });

  it('should throw an UnauthorizedException if credentials are invalid', async () => {
    const email = 'test@test.com';
    const password = 'wrong-password';

    jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

    await expect(localStrategy.validate(email, password)).rejects.toThrow(UnauthorizedException);
  });
});
