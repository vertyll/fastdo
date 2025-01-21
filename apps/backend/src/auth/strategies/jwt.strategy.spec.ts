import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let usersService: jest.Mocked<UsersService>;
  let configService: jest.Mocked<ConfigService>;

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

    jwtStrategy = new JwtStrategy(
      usersService,
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
