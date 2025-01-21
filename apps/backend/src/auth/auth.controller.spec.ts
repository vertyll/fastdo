import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyReply } from 'fastify';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

jest.mock('../common/guards/local-auth.guard');

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
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
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockRegisterDto: RegisterDto = {
    email: 'test@example.com',
    password: 'password123',
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
      const expectedResponse = { accessToken: mockToken };
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

  describe('Input validation', () => {
    it('should validate login DTO', async () => {
      const invalidLoginDto = { email: 'invalid-email', password: '' };
      authService.login.mockRejectedValue(new UnauthorizedException());

      await expect(controller.login(invalidLoginDto as LoginDto))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should validate register DTO', async () => {
      const invalidRegisterDto = { email: 'invalid-email', password: '' };
      authService.register.mockRejectedValue(new UnauthorizedException());

      await expect(controller.register(invalidRegisterDto as RegisterDto))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });
});
