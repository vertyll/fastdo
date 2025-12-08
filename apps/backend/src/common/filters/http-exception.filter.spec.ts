import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockHost: ArgumentsHost;
  let mockRequest: any;
  let mockResponse: any;
  let mockI18n: I18nContext<any>;

  beforeEach(() => {
    mockRequest = {
      url: '/test',
      method: 'GET',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockI18n = {
      t: jest.fn().mockImplementation(key => key),
    } as any;

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as ArgumentsHost;

    jest.spyOn(I18nContext, 'current').mockReturnValue(mockI18n);

    filter = new HttpExceptionFilter();
  });

  it('should format basic http exception', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.send).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String),
      path: '/test',
      method: 'GET',
      message: 'Test error',
    });
  });

  it('should handle validation errors with fields', () => {
    const validationError = {
      message: [
        { field: 'email', errors: ['invalid email'] },
        { field: 'password', errors: ['too short'] },
      ],
    };
    const exception = new HttpException(validationError, HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockResponse.send).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String),
      path: '/test',
      method: 'GET',
      message: 'messages.Validation.failed',
      fields: [
        { field: 'email', errors: ['invalid email'] },
        { field: 'password', errors: ['too short'] },
      ],
    });
  });

  it('should handle missing i18n context', () => {
    jest.spyOn(I18nContext, 'current').mockReturnValue(undefined);
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    expect(() => filter.catch(exception, mockHost)).toThrow('I18nContext not available');
  });

  it('should use default error message when response message is undefined', () => {
    const exception = new HttpException('Http Exception', HttpStatus.INTERNAL_SERVER_ERROR);

    filter.catch(exception, mockHost);

    expect(mockResponse.send).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String),
      path: '/test',
      method: 'GET',
      message: 'Http Exception',
    });
  });

  it('should handle non-array messages in exception response', () => {
    const exception = new HttpException({ message: 'Custom error message' }, HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockResponse.send).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String),
      path: '/test',
      method: 'GET',
      message: 'Custom error message',
    });
  });
});
