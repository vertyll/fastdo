import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Role as RoleEnum } from '../common/enums/role.enum';
import { MailService } from '../mail/services/mail.service';
import { Role } from '../roles/entities/role.entity';
import { RoleRepository } from '../roles/repositories/role.repository';
import { RolesService } from '../roles/roles.service';
import { User } from '../users/entities/user.entity';
import { UserRoleRepository } from '../users/repositories/user-role.repository';
import { UserRepository } from '../users/repositories/user.repository';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { ConfirmationTokenService } from './confirmation-token.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let rolesService: jest.Mocked<RolesService>;
  let jwtService: jest.Mocked<JwtService>;
  let mailService: jest.Mocked<MailService>;
  let confirmationTokenService: jest.Mocked<ConfirmationTokenService>;
  let userRepository: jest.Mocked<UserRepository>;
  let roleRepository: jest.Mocked<RoleRepository>;
  let userRoleRepository: jest.Mocked<UserRoleRepository>;
  let mockQueryRunner: any;

  const mockRole: Role = {
    id: 1,
    name: RoleEnum.User,
    userRoles: [],
  };

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    isActive: true,
    dateCreation: new Date(),
    dateModification: null,
    userRoles: [],
    isEmailConfirmed: true,
    confirmationToken: 'mock-confirmation-token',
    confirmationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn(),
        }),
        save: jest.fn(),
        update: jest.fn(),
      },
      isTransactionActive: true,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
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
            getUserRoles: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendConfirmationEmail: jest.fn(() => Promise.resolve()),
          },
        },
        {
          provide: ConfirmationTokenService,
          useValue: {
            generateToken: jest.fn(() => 'generated-token'),
            verifyToken: jest.fn(() => ({ email: 'test@example.com' })),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => mockQueryRunner),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: RoleRepository,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: UserRoleRepository,
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    rolesService = module.get(RolesService);
    jwtService = module.get(JwtService);
    mailService = module.get(MailService);
    confirmationTokenService = module.get(ConfirmationTokenService);
    userRepository = module.get(UserRepository);
    roleRepository = module.get(RoleRepository);
    userRoleRepository = module.get(UserRoleRepository);
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
  });

  describe('register', () => {
    const registerDto = { email: 'test@example.com', password: 'password123' };
    const hashedPassword = 'hashedPassword123';

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.findOne.mockResolvedValue(null);
      roleRepository.findOne.mockResolvedValue(mockRole);
    });

    it('should successfully register a new user', async () => {
      const newUser = {
        ...mockUser,
        isEmailConfirmed: false,
        confirmationToken: 'generated-token',
        confirmationTokenExpiry: expect.any(Date),
      };

      userRepository.save.mockResolvedValue(newUser);
      userRoleRepository.save.mockResolvedValue({ id: 1, user: newUser, role: mockRole });

      const result = await service.register(registerDto);

      expect(result).toEqual(newUser);
      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        email: registerDto.email,
        password: hashedPassword,
        isEmailConfirmed: false,
        confirmationToken: 'generated-token',
        confirmationTokenExpiry: expect.any(Date),
      }));
      expect(userRoleRepository.save).toHaveBeenCalledWith({
        user: { id: newUser.id },
        role: { id: mockRole.id },
      });
      expect(mailService.sendConfirmationEmail).toHaveBeenCalledWith(
        newUser.email,
        'generated-token',
      );
    });

    it('should throw UnauthorizedException when user already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        new UnauthorizedException('User already exists'),
      );

      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };
    const mockToken = 'jwt.token.here';
    const mockRoles = [RoleEnum.User];

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = mockUser;
      jest.spyOn(service, 'validateUser').mockResolvedValue(userWithoutPassword);
      rolesService.getUserRoles.mockResolvedValue(mockRoles);
      jwtService.sign.mockReturnValue(mockToken);
    });

    it('should return access token when credentials are valid', async () => {
      const result = await service.login(loginDto);

      expect(result).toEqual({ accessToken: mockToken });
      expect(service.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(rolesService.getUserRoles).toHaveBeenCalledWith(mockUser.id);
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        roles: mockRoles,
      });
    });

    it('should throw UnauthorizedException when email is not confirmed', async () => {
      const unconfirmedUser = { ...mockUser, isEmailConfirmed: false };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = unconfirmedUser;
      jest.spyOn(service, 'validateUser').mockResolvedValue(userWithoutPassword);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Please confirm your email first'),
      );
    });
  });

  describe('confirmEmail', () => {
    const confirmationToken = 'valid-confirmation-token';

    beforeEach(() => {
      const validUser = {
        ...mockUser,
        isEmailConfirmed: false,
        confirmationToken,
        confirmationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      userRepository.findOne.mockResolvedValue(validUser);
    });

    it('should successfully confirm email', async () => {
      const unconfirmedUser = {
        ...mockUser,
        isEmailConfirmed: false,
        confirmationToken,
        confirmationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      userRepository.findOne.mockResolvedValue(unconfirmedUser);

      await service.confirmEmail(confirmationToken);

      expect(userRepository.update).toHaveBeenCalledWith(unconfirmedUser.id, {
        isEmailConfirmed: true,
        confirmationToken: null,
        confirmationTokenExpiry: null,
      });
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      confirmationTokenService.verifyToken.mockImplementation(() => {
        throw new UnauthorizedException('Invalid confirmation token');
      });

      await expect(service.confirmEmail(confirmationToken)).rejects.toThrow(
        new UnauthorizedException('Invalid confirmation token'),
      );

      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });
});
