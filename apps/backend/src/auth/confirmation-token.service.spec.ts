import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { ConfirmationTokenService } from './confirmation-token.service';

describe('ConfirmationTokenService', () => {
  let service: ConfirmationTokenService;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let i18nService: jest.Mocked<I18nService>;

  const mockSecret = 'mock-jwt-secret';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfirmationTokenService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(mockSecret),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockReturnValue('Invalid token'),
          },
        },
      ],
    }).compile();

    service = module.get<ConfirmationTokenService>(ConfirmationTokenService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    i18nService = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a token', () => {
      const email = 'test@example.com';
      const mockToken = 'mockToken';
      jwtService.sign.mockReturnValue(mockToken);

      const result = service.generateToken(email);

      expect(result).toBe(mockToken);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email },
        { expiresIn: '24h', secret: mockSecret },
      );
      expect(configService.get).toHaveBeenCalledWith('app.security.jwt.accessTokenSecret');
    });
  });

  describe('verifyToken', () => {
    it('should verify a token and return email', () => {
      const token = 'validToken';
      const mockPayload = { email: 'test@example.com' };
      jwtService.verify.mockReturnValue(mockPayload);

      const result = service.verifyToken(token);

      expect(result).toEqual(mockPayload);
      expect(jwtService.verify).toHaveBeenCalledWith(token, { secret: mockSecret });
      expect(configService.get).toHaveBeenCalledWith('app.security.jwt.accessTokenSecret');
    });

    it('should throw UnauthorizedException with translated message for invalid token', () => {
      const token = 'invalidToken';
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      i18nService.t.mockReturnValue('Translated error message');

      expect(() => service.verifyToken(token)).toThrow(
        new UnauthorizedException('Translated error message'),
      );

      expect(jwtService.verify).toHaveBeenCalledWith(token, { secret: mockSecret });
      expect(configService.get).toHaveBeenCalledWith('app.security.jwt.accessTokenSecret');
      expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.invalidToken');
    });
  });
});
