import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtMiddleware } from './jwt.middleware';

describe('JwtMiddleware', () => {
  let middleware: JwtMiddleware;
  let jwtService: JwtService;

  const mockRequest = (
    authorization?: string,
    url: string = '/test',
    method: string = 'GET',
  ) => {
    const req: any = {
      headers: {
        authorization,
      },
      url,
      method,
    };
    return req;
  };

  const mockResponse = () => {
    const res: any = {
      statusCode: 200,
      end: jest.fn(),
    };
    return res;
  };

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
      ],
    }).compile();

    middleware = module.get<JwtMiddleware>(JwtMiddleware);
    jwtService = module.get<JwtService>(JwtService);
    mockNext.mockClear();
  });

  it('should return 401 when an invalid token is provided', () => {
    const req = mockRequest('Bearer invalidtoken');
    (jwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const res = mockResponse();
    middleware.use(req, res, mockNext);

    expect(res.statusCode).toBe(401);

    const responseBody = JSON.parse(res.end.mock.calls[0][0]);

    expect(responseBody).toEqual({
      statusCode: 401,
      timestamp: expect.any(String),
      path: req.url,
      method: req.method,
      message: 'Invalid token',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle missing path and method in request', () => {
    const req = mockRequest('Bearer invalidtoken', undefined, undefined);
    req.url = undefined;
    req.method = undefined;

    (jwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const res = mockResponse();
    middleware.use(req, res, mockNext);

    expect(res.statusCode).toBe(401);

    const responseBody = JSON.parse(res.end.mock.calls[0][0]);

    expect(responseBody).toEqual({
      statusCode: 401,
      timestamp: expect.any(String),
      path: undefined,
      method: undefined,
      message: 'Invalid token',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
