import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let usersService: Partial<UsersService>;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';

    usersService = {
      findOne: jest.fn(),
    };

    jwtStrategy = new JwtStrategy(usersService as UsersService);
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
      password: 'hashedPassword',
      dateCreation: new Date(),
      dateModification: null,
      userRoles: [],
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
      password: 'hashedPassword',
      dateCreation: new Date(),
      dateModification: null,
      userRoles: [],
    };

    jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

    await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });
});
