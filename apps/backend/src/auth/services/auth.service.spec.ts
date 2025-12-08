import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { I18nService } from 'nestjs-i18n';
import { DataSource, Repository } from 'typeorm';
import { RoleEnum } from '../../common/enums/role.enum';
import { IMailService } from '../../core/mail/interfaces/mail-service.interface';
import { IMailServiceToken } from '../../core/mail/tokens/mail-service.token';
import { DurationConfigProvider } from '../../core/providers/duration-config.provider';
import { Role } from '../../roles/entities/role.entity';
import { IRolesService } from '../../roles/interfaces/roles-service.interface';
import { RoleRepository } from '../../roles/repositories/role.repository';
import { IRolesServiceToken } from '../../roles/tokens/roles-service.token';
import { UserRole } from '../../users/entities/user-role.entity';
import { User } from '../../users/entities/user.entity';
import { IUsersService } from '../../users/interfaces/users-service.interface';
import { UserRepository } from '../../users/repositories/user.repository';
import { IUsersServiceToken } from '../../users/tokens/users-service.token';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { RefreshToken } from '../entities/refresh-token.entity';
import { IConfirmationTokenService } from '../interfaces/confirmation-token-service.interface';
import { IRefreshTokenService } from '../interfaces/refresh-token-service.interface';
import { IConfirmationTokenServiceToken } from '../tokens/confirmation-token-service.token';
import { IRefreshTokenServiceToken } from '../tokens/refresh-token-service.token';
import { AuthService } from './auth.service';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<IUsersService>;
  let rolesService: jest.Mocked<IRolesService>;
  let jwtService: jest.Mocked<JwtService>;
  let mailService: jest.Mocked<IMailService>;
  let confirmationTokenService: jest.Mocked<IConfirmationTokenService>;
  let refreshTokenService: jest.Mocked<IRefreshTokenService>;
  let userRepository: jest.Mocked<UserRepository>;
  let roleRepository: jest.Mocked<RoleRepository>;
  let refreshTokenRepository: jest.Mocked<Repository<RefreshToken>>;
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
      findOne: jest.Mock;
      find: jest.Mock;
      remove: jest.Mock;
    };
    isTransactionActive: boolean;
  };

  const mockRole: Role = {
    id: 1,
    code: RoleEnum.User,
    userRoles: [],
    isActive: false,
    dateCreation: new Date(),
    dateModification: new Date(),
    translations: [],
  };

  const mockRefreshToken: RefreshToken = {
    id: 1,
    token: 'mock-refresh-token',
    dateExpiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    user: {} as User,
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
    avatar: null,
    emailChangeToken: null,
    emailChangeTokenExpiry: null,
    pendingEmail: null,
    refreshTokens: [],
    emailHistories: [],
    projectUserRoles: [],
  };

  mockRefreshToken.user = mockUser;
  mockUser.refreshTokens = [mockRefreshToken];

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
          find: jest.fn(),
          remove: jest.fn(),
        }),
        save: jest.fn(),
        update: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        remove: jest.fn(),
      },
      isTransactionActive: true,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
        {
          provide: IMailServiceToken,
          useValue: {
            sendConfirmationEmail: jest.fn(),
            sendPasswordResetEmail: jest.fn(),
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
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: DurationConfigProvider,
          useValue: {
            getDuration: jest.fn().mockReturnValue(300000),
            getExpiryDate: jest.fn().mockReturnValue(new Date(Date.now() + 300000)),
          },
        },
        {
          provide: IUsersServiceToken,
          useValue: {
            findByEmail: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: IRolesServiceToken,
          useValue: {
            getUserRoles: jest.fn().mockResolvedValue([RoleEnum.User]),
          },
        },
        {
          provide: IConfirmationTokenServiceToken,
          useValue: {
            generateToken: jest.fn().mockReturnValue('generated-token'),
            verifyToken: jest.fn().mockReturnValue({ email: 'test@example.com' }),
          },
        },
        {
          provide: IRefreshTokenServiceToken,
          useValue: {
            saveRefreshToken: jest.fn(),
            validateRefreshToken: jest.fn(),
            removeToken: jest.fn(),
            getUserRefreshTokens: jest.fn(),
            findMatchingRefreshToken: jest.fn(),
            deleteAllUserTokens: jest.fn(),
            deleteExpiredTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    mailService = module.get(IMailServiceToken);
    userRepository = module.get(UserRepository);
    roleRepository = module.get(RoleRepository);
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
    usersService = module.get(IUsersServiceToken);
    rolesService = module.get(IRolesServiceToken);
    confirmationTokenService = module.get(IConfirmationTokenServiceToken);
    refreshTokenService = module.get(IRefreshTokenServiceToken);
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
      expect(mailService.sendConfirmationEmail).toHaveBeenCalledWith(savedUser.email, 'generated-token');
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

    it('should return access token and refresh token when credentials are valid', async () => {
      const result = await service.login(loginDto);

      expect(result).toEqual({ accessToken: 'jwt.token.here', refreshToken: 'jwt.token.here' });
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          email: mockUser.email,
          sub: mockUser.id,
          roles: [RoleEnum.User],
        },
        expect.any(Object),
      );
    });

    it('should throw UnauthorizedException when email is not confirmed', async () => {
      const unconfirmedUser = { ...mockUser, isEmailConfirmed: false };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = unconfirmedUser;
      jest.spyOn(service, 'validateUser').mockResolvedValue(userWithoutPassword);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    const refreshTokenString = 'valid-refresh-token';
    const hashedToken = 'hashed-token';

    beforeEach(() => {
      jwtService.verify.mockReturnValue({ sub: mockUser.id });
      (bcrypt.compare as jest.Mock).mockImplementation((token, hash) =>
        Promise.resolve(token === refreshTokenString && hash === hashedToken),
      );
    });

    it('should successfully refresh tokens', async () => {
      const storedTokens = [
        {
          id: 1,
          token: hashedToken,
          dateExpiration: new Date(Date.now() + 10000),
          user: mockUser,
        },
      ];

      mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockUser);
      refreshTokenService.getUserRefreshTokens.mockResolvedValueOnce(storedTokens);
      refreshTokenService.validateRefreshToken.mockResolvedValueOnce(storedTokens[0]);
      rolesService.getUserRoles.mockResolvedValue([RoleEnum.User]);
      jwtService.sign.mockReturnValue('new.token.here');

      const result = await service.refreshToken(refreshTokenString);

      expect(result).toEqual({
        accessToken: 'new.token.here',
        refreshToken: 'new.token.here',
      });
      expect(refreshTokenService.removeToken).toHaveBeenCalledWith(
        expect.objectContaining({
          id: storedTokens[0].id,
          token: storedTokens[0].token,
          user: expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
          }),
        }),
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when no tokens are found', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockUser);
      refreshTokenService.getUserRefreshTokens.mockResolvedValueOnce([]);
      refreshTokenService.validateRefreshToken.mockRejectedValueOnce(new UnauthorizedException('translated message'));

      await expect(service.refreshToken(refreshTokenString)).rejects.toThrow(UnauthorizedException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token has expired', async () => {
      const expiredToken = {
        id: 1,
        token: hashedToken,
        dateExpiration: new Date(Date.now() - 10000),
        user: mockUser,
      };

      mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockUser);
      refreshTokenService.getUserRefreshTokens.mockResolvedValueOnce([expiredToken]);
      refreshTokenService.validateRefreshToken.mockRejectedValueOnce(new UnauthorizedException('translated message'));

      await expect(service.refreshToken(refreshTokenString)).rejects.toThrow(UnauthorizedException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when no valid token is found', async () => {
      const invalidToken = {
        id: 1,
        token: 'different-hash',
        dateExpiration: new Date(Date.now() + 10000),
        user: mockUser,
      };

      mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockUser);
      refreshTokenService.getUserRefreshTokens.mockResolvedValueOnce([invalidToken]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      refreshTokenService.validateRefreshToken.mockRejectedValueOnce(new UnauthorizedException('translated message'));

      await expect(service.refreshToken(refreshTokenString)).rejects.toThrow(UnauthorizedException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should remove the refresh token', async () => {
      const validToken = {
        id: 1,
        token: 'hashed-token',
        dateExpiration: new Date(Date.now() + 10000),
        user: mockUser,
      };

      refreshTokenService.getUserRefreshTokens.mockResolvedValue([validToken]);
      refreshTokenService.findMatchingRefreshToken.mockResolvedValue(validToken);

      await service.logout(mockUser.id, 'valid-token');

      expect(refreshTokenService.removeToken).toHaveBeenCalledWith(
        expect.objectContaining({
          id: validToken.id,
          token: validToken.token,
          user: expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
          }),
        }),
      );
    });

    it('should not remove the refresh token if it does not match', async () => {
      const invalidToken = {
        id: 1,
        token: 'hashed-token',
        dateExpiration: new Date(Date.now() + 10000),
        user: mockUser,
      };

      refreshTokenService.getUserRefreshTokens.mockResolvedValue([invalidToken]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await service.logout(mockUser.id, 'invalid-token');

      expect(refreshTokenService.removeToken).not.toHaveBeenCalled();
    });
  });

  describe('logoutFromAllDevices', () => {
    it('should delete all refresh tokens for the user', async () => {
      const userId = 1;
      await service.logoutFromAllDevices(userId);
      expect(refreshTokenService.deleteAllUserTokens).toHaveBeenCalledWith(userId);
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
      const result = await service.confirmEmail(token);

      expect(result).toEqual({
        success: true,
        email: mockUser.email,
      });
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        isEmailConfirmed: true,
        confirmationToken: null,
        confirmationTokenExpiry: null,
      });
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should return failure when token is invalid', async () => {
      confirmationTokenService.verifyToken.mockImplementationOnce(() => {
        throw new UnauthorizedException();
      });

      await expect(service.confirmEmail(token)).rejects.toThrow(UnauthorizedException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should return failure when token has expired', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        isEmailConfirmed: false,
        confirmationToken: token,
        confirmationTokenExpiry: new Date(Date.now() - 1000),
      });

      const result = await service.confirmEmail(token);

      expect(result).toEqual({
        success: false,
        email: mockUser.email,
      });
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      confirmationTokenService.verifyToken.mockImplementation(() => {
        throw new UnauthorizedException();
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
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(email, generatedToken);
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

      expect(bcrypt.hash).toHaveBeenCalledWith(resetPasswordDto.password, 10);
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({
        user: { id: mockUser.id },
      });
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

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(UnauthorizedException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token has expired', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        confirmationToken: resetPasswordDto.token,
        confirmationTokenExpiry: new Date(Date.now() - 1000),
      });

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(UnauthorizedException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(UnauthorizedException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
