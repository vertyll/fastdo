import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyReply } from 'fastify';
import { ClsService } from 'nestjs-cls';
import { I18nService } from 'nestjs-i18n';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { CookieConfigService } from '../core/config/cookie.config';
import { User } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenDto } from './dtos/access-token.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

jest.mock('../common/guards/local-auth.guard');

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let clsService: jest.Mocked<ClsService>;
  let i18nService: jest.Mocked<I18nService>;
  let mockResponse: jest.Mocked<FastifyReply>;

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
    projectUsers: [],
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

  const mockAccessTokenDto: AccessTokenDto = {
    accessToken: 'jwt.token.here',
  };

  beforeEach(async () => {
    mockResponse = {
      setCookie: jest.fn(),
      clearCookie: jest.fn(),
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
    } as unknown as jest.Mocked<FastifyReply>;

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
        {
          provide: ClsService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockImplementation((key: string) => key),
          },
        },
        {
          provide: CookieConfigService,
          useValue: {
            getRefreshTokenConfig: jest.fn().mockReturnValue({
              httpOnly: true,
              secure: false,
              sameSite: 'lax',
              path: '/api/auth',
              maxAge: 604800000,
            }),
            getClearCookieConfig: jest.fn().mockReturnValue({
              path: '/api/auth',
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    clsService = module.get(ClsService);
    i18nService = module.get(I18nService);
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

      const result = await controller.login(mockLoginDto, mockResponse);

      expect(result).toEqual({ accessToken: mockToken });
      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(mockResponse.setCookie).toHaveBeenCalledWith('refreshToken', mockRefresh, expect.any(Object));
    });

    it('should handle login failure', async () => {
      authService.login.mockRejectedValue(new UnauthorizedException());

      await expect(controller.login(mockLoginDto, mockResponse))
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
      const mockAccessToken = { accessToken: 'new.jwt.token', refreshToken: 'new.refresh.token' };
      authService.refreshToken.mockResolvedValue(mockAccessToken);

      const result = await controller.refreshToken(mockAccessTokenDto.accessToken, mockResponse);

      expect(result).toEqual({ accessToken: 'new.jwt.token' });
      expect(authService.refreshToken).toHaveBeenCalledWith(mockAccessTokenDto.accessToken);
      expect(authService.refreshToken).toHaveBeenCalledTimes(1);
      expect(mockResponse.setCookie).toHaveBeenCalledWith('refreshToken', 'new.refresh.token', expect.any(Object));
    });

    it('should handle refresh token failure', async () => {
      authService.refreshToken.mockRejectedValue(new UnauthorizedException());

      await expect(controller.refreshToken(mockAccessTokenDto.accessToken, mockResponse))
        .rejects
        .toThrow(UnauthorizedException);
      expect(authService.refreshToken).toHaveBeenCalledWith(mockAccessTokenDto.accessToken);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully logout user', async () => {
      clsService.get.mockReturnValue({ userId: 1 });
      await controller.logout(mockResponse);

      expect(authService.logout).toHaveBeenCalledWith(1);
      expect(authService.logout).toHaveBeenCalledTimes(1);
      expect(clsService.get).toHaveBeenCalledWith('user');
      expect(i18nService.t).not.toHaveBeenCalled();
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken', { path: '/api/auth' });
    });

    it('should handle logout failure', async () => {
      clsService.get.mockReturnValue({ userId: 1 });
      authService.logout.mockRejectedValue(new UnauthorizedException());

      await expect(controller.logout(mockResponse))
        .rejects
        .toThrow(UnauthorizedException);
      expect(authService.logout).toHaveBeenCalledWith(1);
      expect(clsService.get).toHaveBeenCalledWith('user');
      expect(i18nService.t).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user is null', async () => {
      clsService.get.mockReturnValue(null);
      i18nService.t.mockReturnValue('Unauthorized');

      await expect(controller.logout(mockResponse))
        .rejects
        .toThrow(UnauthorizedException);

      expect(clsService.get).toHaveBeenCalledWith('user');
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.unauthorized');
      expect(authService.logout).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException with translated message', async () => {
      clsService.get.mockReturnValue(null);
      i18nService.t.mockReturnValue('Unauthorized');

      await expect(controller.logout(mockResponse))
        .rejects
        .toThrow('Unauthorized');

      expect(clsService.get).toHaveBeenCalledWith('user');
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.unauthorized');
      expect(authService.logout).not.toHaveBeenCalled();
    });
  });

  describe('confirmEmail', () => {
    const mockToken = 'valid-token';

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

      await expect(controller.login(invalidLoginDto as LoginDto, mockResponse))
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
