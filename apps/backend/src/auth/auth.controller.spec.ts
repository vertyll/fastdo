import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyReply } from 'fastify';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { User } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';

jest.mock('../common/guards/local-auth.guard');

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    isActive: true,
    dateCreation: new Date(),
    dateModification: null,
    userRoles: [],
    isEmailConfirmed: false,
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
    refreshToken: null,
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockRegisterDto: RegisterDto = {
    email: 'test@example.com',
    password: 'password123',
    termsAccepted: true,
    privacyPolicyAccepted: true,
  };

  const mockForgotPasswordDto = {
    email: 'test@example.com',
  };

  const mockResetPasswordDto = {
    token: 'valid-reset-token',
    password: 'newPassword123',
  };

  const mockRefreshTokenDto: RefreshTokenDto = {
    refreshToken: 'valid-refresh-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
            confirmEmail: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'app.frontend.url':
                  return 'http://localhost:3000';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should have LocalAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', AuthController.prototype.login);
      expect(guards).toBeDefined();
      expect(guards[0]).toBe(LocalAuthGuard);
    });

    it('should have Public decorator', () => {
      const isPublic = Reflect.getMetadata('isPublic', AuthController.prototype.login);
      expect(isPublic).toBe(true);
    });

    it('should successfully login user and return access token', async () => {
      const mockToken = 'jwt.token.here';
      const mockRefresh = 'refresh.token.here';
      const expectedResponse = { accessToken: mockToken, refreshToken: mockRefresh };
      authService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(mockLoginDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should handle login failure', async () => {
      authService.login.mockRejectedValue(new UnauthorizedException());

      await expect(controller.login(mockLoginDto))
        .rejects
        .toThrow(UnauthorizedException);
      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
    });
  });

  describe('register', () => {
    it('should have Public decorator', () => {
      const isPublic = Reflect.getMetadata('isPublic', AuthController.prototype.register);
      expect(isPublic).toBe(true);
    });

    it('should successfully register new user', async () => {
      authService.register.mockResolvedValue(mockUser);

      const result = await controller.register(mockRegisterDto);

      expect(result).toEqual(mockUser);
      expect(authService.register).toHaveBeenCalledWith(mockRegisterDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should handle registration with existing email', async () => {
      authService.register.mockRejectedValue(
        new UnauthorizedException('User already exists'),
      );

      await expect(controller.register(mockRegisterDto))
        .rejects
        .toThrow(UnauthorizedException);
      expect(authService.register).toHaveBeenCalledWith(mockRegisterDto);
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh access token', async () => {
      const mockAccessToken = { accessToken: 'new.jwt.token' };
      authService.refreshToken.mockResolvedValue(mockAccessToken);

      const result = await controller.refreshToken(mockRefreshTokenDto);

      expect(result).toEqual(mockAccessToken);
      expect(authService.refreshToken).toHaveBeenCalledWith(mockRefreshTokenDto.refreshToken);
      expect(authService.refreshToken).toHaveBeenCalledTimes(1);
    });

    it('should handle refresh token failure', async () => {
      authService.refreshToken.mockRejectedValue(new UnauthorizedException());

      await expect(controller.refreshToken(mockRefreshTokenDto))
        .rejects
        .toThrow(UnauthorizedException);
      expect(authService.refreshToken).toHaveBeenCalledWith(mockRefreshTokenDto.refreshToken);
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const mockUserId = 1;
      await controller.logout(mockUserId);

      expect(authService.logout).toHaveBeenCalledWith(mockUserId);
      expect(authService.logout).toHaveBeenCalledTimes(1);
    });

    it('should handle logout failure', async () => {
      const mockUserId = 1;
      authService.logout.mockRejectedValue(new UnauthorizedException());

      await expect(controller.logout(mockUserId))
        .rejects
        .toThrow(UnauthorizedException);
      expect(authService.logout).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('confirmEmail', () => {
    const mockToken = 'valid-token';
    const mockResponse = {
      redirect: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      headers: jest.fn().mockReturnThis(),
      getHeaders: jest.fn().mockReturnThis(),
      raw: {},
      request: {},
      context: {},
      server: {},
    } as unknown as FastifyReply;

    it('should confirm email and redirect to frontend', async () => {
      authService.confirmEmail.mockResolvedValue(undefined);

      await controller.confirmEmail(mockToken, mockResponse);

      expect(authService.confirmEmail).toHaveBeenCalledWith(mockToken);
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/login?confirmed=true',
        302,
      );
    });

    it('should handle confirmation failure', async () => {
      authService.confirmEmail.mockRejectedValue(
        new UnauthorizedException('Invalid token'),
      );

      await expect(
        controller.confirmEmail(mockToken, mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should have Public decorator', () => {
      const isPublic = Reflect.getMetadata('isPublic', AuthController.prototype.forgotPassword);
      expect(isPublic).toBe(true);
    });

    it('should successfully process forgot password request', async () => {
      authService.forgotPassword.mockResolvedValue(undefined);

      await controller.forgotPassword(mockForgotPasswordDto);

      expect(authService.forgotPassword).toHaveBeenCalledWith(mockForgotPasswordDto);
      expect(authService.forgotPassword).toHaveBeenCalledTimes(1);
    });

    it('should handle forgot password request for non-existent email', async () => {
      authService.forgotPassword.mockResolvedValue(undefined);

      await controller.forgotPassword({ email: 'nonexistent@example.com' });

      expect(authService.forgotPassword).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetPassword', () => {
    it('should have Public decorator', () => {
      const isPublic = Reflect.getMetadata('isPublic', AuthController.prototype.resetPassword);
      expect(isPublic).toBe(true);
    });

    it('should successfully reset password', async () => {
      authService.resetPassword.mockResolvedValue(undefined);

      await controller.resetPassword(mockResetPasswordDto);

      expect(authService.resetPassword).toHaveBeenCalledWith(mockResetPasswordDto);
      expect(authService.resetPassword).toHaveBeenCalledTimes(1);
    });

    it('should handle reset password with invalid token', async () => {
      authService.resetPassword.mockRejectedValue(
        new UnauthorizedException('Invalid token'),
      );

      await expect(controller.resetPassword(mockResetPasswordDto))
        .rejects
        .toThrow(UnauthorizedException);
      expect(authService.resetPassword).toHaveBeenCalledWith(mockResetPasswordDto);
    });

    it('should handle reset password with expired token', async () => {
      authService.resetPassword.mockRejectedValue(
        new UnauthorizedException('Token expired'),
      );

      await expect(controller.resetPassword(mockResetPasswordDto))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('Input validation', () => {
    it('should validate login DTO', async () => {
      const invalidLoginDto: Partial<LoginDto> = { email: 'invalid-email', password: '' };
      authService.login.mockRejectedValue(new UnauthorizedException());

      await expect(controller.login(invalidLoginDto as LoginDto))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should validate register DTO', async () => {
      const invalidRegisterDto: Partial<RegisterDto> = {
        email: 'invalid-email',
        password: '',
        termsAccepted: false,
        privacyPolicyAccepted: false,
      };
      authService.register.mockRejectedValue(new UnauthorizedException());

      await expect(controller.register(invalidRegisterDto as RegisterDto))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should validate forgot password DTO', async () => {
      const invalidForgotPasswordDto = { email: 'invalid-email' };
      authService.forgotPassword.mockRejectedValue(new UnauthorizedException());

      await expect(controller.forgotPassword(invalidForgotPasswordDto))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should validate reset password DTO', async () => {
      const invalidResetPasswordDto = {
        token: '',
        password: 'short',
      };
      authService.resetPassword.mockRejectedValue(new UnauthorizedException());

      await expect(controller.resetPassword(invalidResetPasswordDto))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });
});
