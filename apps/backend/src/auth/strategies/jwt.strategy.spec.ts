import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let usersService: Partial<UsersService>;
  let configService: Partial<ConfigService>;

  beforeEach(() => {
    usersService = {
      findOne: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    jwtStrategy = new JwtStrategy(
      usersService as UsersService,
      configService as ConfigService,
    );
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('should validate and return a user if valid payload is provided', async () => {
    const payload = { sub: 1, roles: ['admin'] };
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

    jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

    const result = await jwtStrategy.validate(payload);

    expect(usersService.findOne).toHaveBeenCalledWith(payload.sub);
    expect(result).toEqual({ ...mockUser, roles: payload.roles });
  });

  it('should throw an UnauthorizedException if user is not found', async () => {
    const payload = { sub: 1, roles: ['admin'] };

    jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

    await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw an UnauthorizedException if user is inactive', async () => {
    const payload = { sub: 1, roles: ['admin'] };
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      isActive: false,
      isEmailConfirmed: true,
      password: 'hashedPassword',
      dateCreation: new Date(),
      dateModification: null,
      userRoles: [],
      confirmationToken: 'token',
      confirmationTokenExpiry: new Date(),
    };

    jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

    await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });
});