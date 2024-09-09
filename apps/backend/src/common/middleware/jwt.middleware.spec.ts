import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { JwtMiddleware } from "./jwt.middleware";
import { UnauthorizedException } from "@nestjs/common";

describe("JwtMiddleware", () => {
  let middleware: JwtMiddleware;
  let jwtService: JwtService;

  const mockRequest = () => {
    const req: any = {};
    req.headers = {};
    return req;
  };

  const mockResponse = () => {
    const res: any = {};
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

  it("should be defined", () => {
    expect(middleware).toBeDefined();
  });

  it("should pass when no token is provided", () => {
    const req = mockRequest();
    middleware.use(req, mockResponse(), mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it("should set user when valid token is provided", () => {
    const req = mockRequest();
    req.headers.authorization = "Bearer validtoken";
    const payload = { userId: "123" };
    (jwtService.verify as jest.Mock).mockReturnValue(payload);

    middleware.use(req, mockResponse(), mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.user).toEqual(payload);
  });

  it("should throw UnauthorizedException when invalid token is provided", () => {
    const req = mockRequest();
    req.headers.authorization = "Bearer invalidtoken";
    (jwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    expect(() => middleware.use(req, mockResponse(), mockNext)).toThrow(
      UnauthorizedException
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should ignore non-Bearer tokens", () => {
    const req = mockRequest();
    req.headers.authorization = "Basic sometoken";

    middleware.use(req, mockResponse(), mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });
});
