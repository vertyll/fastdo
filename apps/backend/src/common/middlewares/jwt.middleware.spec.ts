import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { JwtMiddleware } from './jwt.middleware';

describe('JwtMiddleware', () => {
  let middleware: JwtMiddleware;
  let jwtService: jest.Mocked<JwtService>;
  let i18nService: jest.Mocked<I18nService>;

  const mockRequest = (authorization?: string, url: string = '/test', method: string = 'GET') =>
    ({
      headers: { authorization },
      url,
      method,
    }) as any;

  const mockResponse = () =>
    ({
      statusCode: 200,
      end: jest.fn(),
    }) as any;

  const mockNext = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtMiddleware,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockReturnValue('Translated error message'),
          },
        },
      ],
    }).compile();

    middleware = module.get<JwtMiddleware>(JwtMiddleware);
    jwtService = module.get(JwtService);
    i18nService = module.get(I18nService);
    mockNext.mockClear();
  });

  it('should return 401 with translated message when invalid token is provided', () => {
    const req = mockRequest('Bearer invalidtoken');
    jwtService.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });
    i18nService.t.mockReturnValue('Translated invalid token message');

    const res = mockResponse();
    middleware.use(req, res, mockNext);

    expect(res.statusCode).toBe(401);
    const responseBody = JSON.parse(res.end.mock.calls[0][0]);
    expect(responseBody).toEqual({
      statusCode: 401,
      timestamp: expect.any(String),
      path: req.url,
      method: req.method,
      message: 'Translated invalid token message',
    });
    expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.invalidToken');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle missing path and method in request', () => {
    const req = mockRequest('Bearer invalidtoken', undefined, undefined);
    req.url = undefined;
    req.method = undefined;
    jwtService.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });
    i18nService.t.mockReturnValue('Translated invalid token message');

    const res = mockResponse();
    middleware.use(req, res, mockNext);

    expect(res.statusCode).toBe(401);
    const responseBody = JSON.parse(res.end.mock.calls[0][0]);
    expect(responseBody).toEqual({
      statusCode: 401,
      timestamp: expect.any(String),
      path: undefined,
      method: undefined,
      message: 'Translated invalid token message',
    });
    expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.invalidToken');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should log translated error when verifying token fails', () => {
    const req = mockRequest('Bearer invalidtoken');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    jwtService.verify.mockImplementation(() => {
      throw new Error('Verification failed');
    });
    i18nService.t.mockReturnValueOnce('Token verification failed').mockReturnValueOnce('Invalid token message');

    const res = mockResponse();
    middleware.use(req, res, mockNext);

    expect(consoleSpy).toHaveBeenCalledWith('Token verification failed', expect.any(Error));
    expect(i18nService.t).toHaveBeenCalledWith('messages.Auth.errors.verifyingTokenFailed');
    consoleSpy.mockRestore();
  });
});
