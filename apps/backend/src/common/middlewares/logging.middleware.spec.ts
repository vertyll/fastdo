import { LoggingMiddleware } from './logging.middleware';

describe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware;
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    middleware = new LoggingMiddleware();
    mockRequest = {};
    mockResponse = {
      on: jest.fn(),
    };
    mockNext = jest.fn();
    jest.spyOn(console, 'time').mockImplementation();
    jest.spyOn(console, 'timeEnd').mockImplementation();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call console.time and next', () => {
    middleware.use(mockRequest, mockResponse, mockNext);
    expect(console.time).toHaveBeenCalledWith(expect.stringContaining('Request-response time'));
    expect(mockNext).toHaveBeenCalled();
  });

  it('should set up response.on with finish event', () => {
    middleware.use(mockRequest, mockResponse, mockNext);
    expect(mockResponse.on).toHaveBeenCalledWith(
      'finish',
      expect.any(Function),
    );
  });

  it('should call console.timeEnd when response finishes', () => {
    middleware.use(mockRequest, mockResponse, mockNext);
    const finishCallback = mockResponse.on.mock.calls[0][1];
    finishCallback();
    expect(console.timeEnd).toHaveBeenCalledWith(expect.stringContaining('Request-response time'));
  });
});
