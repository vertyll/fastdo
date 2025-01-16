import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';
import { RolesService } from '../roles/roles.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let rolesService: jest.Mocked<RolesService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    isActive: true,
    dateCreation: new Date(),
    dateModification: null,
    userRoles: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: RolesService,
          useValue: {
            findRoleByName: jest.fn(),
            addRoleToUser: jest.fn(),
            getUserRoles: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    rolesService = module.get(RolesService);
    jwtService = module.get(JwtService);
  });

  describe('validateUser', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return user without password when credentials are valid', async () => {
      const password = 'password123';
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(mockUser.email, password);

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('email', mockUser.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
    });

    it('should return null when user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(mockUser.email, 'wrongPassword');

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', mockUser.password);
    });
  });

  describe('register', () => {
    const registerDto = { email: 'test@example.com', password: 'password123' };
    const hashedPassword = 'hashedPassword123';

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
    });

    it('should successfully register a new user', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);
      rolesService.findRoleByName.mockResolvedValue({ id: 1, name: Role.User } as any);
      rolesService.addRoleToUser.mockResolvedValue(undefined);

      const result = await service.register(registerDto);

      expect(result).toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: hashedPassword,
      });
      expect(rolesService.addRoleToUser).toHaveBeenCalledWith(mockUser.id, Role.User);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it('should throw UnauthorizedException when user already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        new UnauthorizedException('User already exists'),
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when role does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      rolesService.findRoleByName.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(
        new UnauthorizedException('Role does not exist'),
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };
    const mockToken = 'jwt.token.here';
    const mockRoles = [Role.User];

    it('should return access token when credentials are valid', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = mockUser;

      jest.spyOn(service, 'validateUser').mockResolvedValue(userWithoutPassword);
      rolesService.getUserRoles.mockResolvedValue(mockRoles);
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(result).toEqual({ access_token: mockToken });
      expect(service.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(rolesService.getUserRoles).toHaveBeenCalledWith(mockUser.id);
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        roles: mockRoles,
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(rolesService.getUserRoles).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
