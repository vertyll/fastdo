import { HttpExceptionFilter } from "./http-exception.filter";
import { HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

describe("HttpExceptionFilter", () => {
  let filter: HttpExceptionFilter;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(async () => {
    mockLogger = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpExceptionFilter,
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
  });

  it("should log the error", () => {
    const mockException = new HttpException(
      "Test error",
      HttpStatus.BAD_REQUEST
    );
    const mockArgumentsHost = {
      switchToHttp: () => ({
        getResponse: () => ({
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
        }),
        getRequest: () => ({
          url: "/test",
          method: "GET",
        }),
      }),
    } as any;

    filter.catch(mockException, mockArgumentsHost);

    expect(mockLogger.error).toHaveBeenCalled();
  });
});
