import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { DataSource } from 'typeorm';
import { Role as RoleEnum } from '../common/enums/role.enum';
import { MailService } from '../core/mail/services/mail.service';
import { Role } from '../roles/entities/role.entity';
import { RoleRepository } from '../roles/repositories/role.repository';
import { RolesService } from '../roles/roles.service';
import { UserRole } from '../users/entities/user-role.entity';
import { User } from '../users/entities/user.entity';
import { UserRepository } from '../users/repositories/user.repository';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { ConfirmationTokenService } from './confirmation-token.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

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
  let mockQueryRunner: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
    manager: {
      getRepository: jest.Mock;
      save: jest.Mock;
      update: jest.Mock;
    };
    isTransactionActive: boolean;
  };

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
    termsAccepted: true,
    privacyPolicyAccepted: true,
    dateTermsAcceptance: new Date(),
    datePrivacyPolicyAcceptance: new Date(),
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
          save: jest.fn().mockImplementation((entity: Partial<User>) => entity),
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
          useValue: { findByEmail: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
        {
          provide: RolesService,
          useValue: { getUserRoles: jest.fn() },
        },
        {
          provide: MailService,
          useValue: {
            sendConfirmationEmail: jest.fn(),
            sendPasswordResetEmail: jest.fn(),
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
          useValue: { createQueryRunner: jest.fn(() => mockQueryRunner) },
        },
        {
          provide: UserRepository,
          useValue: { findOne: jest.fn(), save: jest.fn(), update: jest.fn() },
        },
        {
          provide: RoleRepository,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(10) },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockReturnValue('translated message'),
            translate: jest.fn().mockReturnValue('translated message'),
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
  });

  describe('validateUser', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return user without password when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(mockUser.email, 'password123');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('email', mockUser.email);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
    });

    it('should return null when user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      termsAccepted: true,
      privacyPolicyAccepted: true,
    };

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      userRepository.findOne.mockResolvedValue(null);
      roleRepository.findOne.mockResolvedValue(mockRole);
    });

    it('should successfully register a new user', async () => {
      const savedUser = {
        id: 1,
        email: registerDto.email,
        password: 'hashedPassword123',
        isEmailConfirmed: false,
        confirmationToken: 'generated-token',
        confirmationTokenExpiry: expect.any(Date),
        termsAccepted: true,
        privacyPolicyAccepted: true,
        dateTermsAcceptance: expect.any(Date),
        datePrivacyPolicyAcceptance: expect.any(Date),
      };

      mockQueryRunner.manager.getRepository(User).save.mockResolvedValue(savedUser);

      const result = await service.register(registerDto);

      expect(result).toEqual(savedUser);
      expect(mockQueryRunner.manager.getRepository(User).save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          password: 'hashedPassword123',
          termsAccepted: true,
          privacyPolicyAccepted: true,
          dateTermsAcceptance: expect.any(Date),
          datePrivacyPolicyAcceptance: expect.any(Date),
        }),
      );
      expect(mockQueryRunner.manager.getRepository(UserRole).save).toHaveBeenCalledWith({
        user: { id: savedUser.id },
        role: { id: mockRole.id },
      });
      expect(mailService.sendConfirmationEmail).toHaveBeenCalledWith(
        savedUser.email,
        'generated-token',
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should store terms acceptance dates when terms are accepted', async () => {
      mockQueryRunner.manager.getRepository(User).save.mockImplementation((userData: Partial<User>) => ({
        ...userData,
        id: 1,
      }));

      await service.register(registerDto);

      expect(mockQueryRunner.manager.getRepository(User).save).toHaveBeenCalledWith(
        expect.objectContaining({
          dateTermsAcceptance: expect.any(Date),
          datePrivacyPolicyAcceptance: expect.any(Date),
        }),
      );
    });

    it('should throw UnauthorizedException when user already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(UnauthorizedException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when role does not exist', async () => {
      roleRepository.findOne.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(UnauthorizedException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = mockUser;
      jest.spyOn(service, 'validateUser').mockResolvedValue(userWithoutPassword);
      rolesService.getUserRoles.mockResolvedValue([RoleEnum.User]);
      jwtService.sign.mockReturnValue('jwt.token.here');
    });

    it('should return access token when credentials are valid', async () => {
      const result = await service.login(loginDto);

      expect(result).toEqual({ accessToken: 'jwt.token.here' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        roles: [RoleEnum.User],
      });
    });

    it('should throw UnauthorizedException when email is not confirmed', async () => {
      const unconfirmedUser = { ...mockUser, isEmailConfirmed: false };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = unconfirmedUser;
      jest.spyOn(service, 'validateUser').mockResolvedValue(userWithoutPassword);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('confirmEmail', () => {
    const token = 'valid-confirmation-token';

    beforeEach(() => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        isEmailConfirmed: false,
        confirmationToken: token,
        confirmationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    });

    it('should successfully confirm email', async () => {
      await service.confirmEmail(token);

      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        isEmailConfirmed: true,
        confirmationToken: null,
        confirmationTokenExpiry: null,
      });
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      confirmationTokenService.verifyToken.mockImplementation(() => {
        throw new UnauthorizedException();
      });

      await expect(service.confirmEmail(token)).rejects.toThrow(UnauthorizedException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token has expired', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        confirmationTokenExpiry: new Date(Date.now() - 1000),
      });

      await expect(service.confirmEmail(token)).rejects.toThrow(UnauthorizedException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    const email = 'test@example.com';
    const generatedToken = 'generated-reset-token';

    beforeEach(() => {
      confirmationTokenService.generateToken.mockReturnValue(generatedToken);
      userRepository.findOne.mockResolvedValue(mockUser);
    });

    it('should generate and send reset token when user exists', async () => {
      await service.forgotPassword({ email });

      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          confirmationToken: generatedToken,
          confirmationTokenExpiry: expect.any(Date),
        }),
      );
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        email,
        generatedToken,
      );
    });

    it('should not reveal user existence when email is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await service.forgotPassword({ email });

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto = {
      token: 'valid-reset-token',
      password: 'newPassword123',
    };

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      confirmationTokenService.verifyToken.mockReturnValue({ email: mockUser.email });
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        confirmationToken: resetPasswordDto.token,
        confirmationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    });

    it('should successfully reset password', async () => {
      await service.resetPassword(resetPasswordDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(
        resetPasswordDto.password,
        10,
      );
      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          password: 'newHashedPassword',
          confirmationToken: null,
          confirmationTokenExpiry: null,
          dateModification: expect.any(Date),
        }),
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        confirmationToken: 'different-token',
      });

      await expect(service.resetPassword(resetPasswordDto))
        .rejects.toThrow(UnauthorizedException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token has expired', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        confirmationToken: resetPasswordDto.token,
        confirmationTokenExpiry: new Date(Date.now() - 1000), // expired
      });

      await expect(service.resetPassword(resetPasswordDto))
        .rejects.toThrow(UnauthorizedException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto))
        .rejects.toThrow(UnauthorizedException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
