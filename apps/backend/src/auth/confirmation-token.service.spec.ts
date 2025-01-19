import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmationTokenService } from './confirmation-token.service';

describe('ConfirmationTokenService', () => {
  let service: ConfirmationTokenService;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

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
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConfirmationTokenService>(ConfirmationTokenService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a token', () => {
      const email = 'test@example.com';
      const mockToken = 'mockToken';
      configService.get.mockReturnValue('secret');
      jwtService.sign.mockReturnValue(mockToken);

      const result = service.generateToken(email);

      expect(result).toBe(mockToken);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email },
        { expiresIn: '24h', secret: 'secret' },
      );
      expect(configService.get).toHaveBeenCalledWith('jwt.secret');
    });
  });

  describe('verifyToken', () => {
    it('should verify a token and return email', () => {
      const token = 'validToken';
      const mockPayload = { email: 'test@example.com' };
      configService.get.mockReturnValue('secret');
      jwtService.verify.mockReturnValue(mockPayload);

      const result = service.verifyToken(token);

      expect(result).toEqual(mockPayload);
      expect(jwtService.verify).toHaveBeenCalledWith(token, { secret: 'secret' });
      expect(configService.get).toHaveBeenCalledWith('jwt.secret');
    });

    it('should throw UnauthorizedException for invalid token', () => {
      const token = 'invalidToken';
      configService.get.mockReturnValue('secret');
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.verifyToken(token)).toThrow(UnauthorizedException);
      expect(jwtService.verify).toHaveBeenCalledWith(token, { secret: 'secret' });
      expect(configService.get).toHaveBeenCalledWith('jwt.secret');
    });
  });
});
