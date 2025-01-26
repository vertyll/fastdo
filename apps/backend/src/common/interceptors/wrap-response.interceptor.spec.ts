import { BadRequestException, CallHandler, ExecutionContext, HttpException } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { of, throwError } from 'rxjs';
import { WrapResponseInterceptor } from './wrap-response.interceptor';

describe('WrapResponseInterceptor', () => {
  let interceptor: WrapResponseInterceptor<any>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockI18n: I18nContext<any>;

  beforeEach(() => {
    mockI18n = {
      t: jest.fn().mockReturnValue('Success Message'),
    } as any;

    const mockRequest = {
      url: '/test',
      method: 'GET',
    };

    const mockResponse = {
      statusCode: 200,
      statusMessage: 'OK',
    };

    mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    mockCallHandler = {
      handle: () => of({ data: 'test' }),
    };

    jest.spyOn(I18nContext, 'current').mockReturnValue(mockI18n);

    interceptor = new WrapResponseInterceptor();
  });

  it('should successfully wrap a response', done => {
    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: response => {
        expect(response).toEqual({
          data: { data: 'test' },
          statusCode: 200,
          timestamp: expect.any(String),
          path: '/test',
          method: 'GET',
          message: 'OK',
        });
        done();
      },
      error: done,
    });
  });

  it('should handle BadRequestException with validation errors', done => {
    const validationError = {
      message: ['validation error'],
      error: 'Bad Request',
    };

    mockCallHandler = {
      handle: () => throwError(() => new BadRequestException(validationError)),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: (error: HttpException) => {
        const response = error.getResponse() as any;
        expect(response).toEqual({
          data: null,
          statusCode: 400,
          timestamp: expect.any(String),
          path: '/test',
          method: 'GET',
          message: 'Bad Request Exception',
          errors: validationError,
        });
        done();
      },
    });
  });

  it('should handle internal server error when I18nContext is not available', done => {
    jest.spyOn(I18nContext, 'current').mockReturnValue(undefined);

    try {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => done.fail('Should have thrown an error'),
        error: error => {
          expect(error.message).toBe('I18nContext not available');
          done();
        },
      });
    } catch (error: any) {
      expect(error.message).toBe('I18nContext not available');
      done();
    }
  });

  it('should use i18n translation when response status message is not available', done => {
    const mockResponseWithoutMessage = {
      statusCode: 200,
    };

    mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ url: '/test', method: 'GET' }),
        getResponse: () => mockResponseWithoutMessage,
      }),
    } as ExecutionContext;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: response => {
        expect(response.message).toBe('Success Message');
        done();
      },
      error: done,
    });
  });

  it('should handle unknown errors by throwing InternalServerErrorException', done => {
    mockCallHandler = {
      handle: () => throwError(() => new Error('Unknown error')),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: error => {
        expect(error.getStatus()).toBe(500);
        expect(error.getResponse()).toHaveProperty('message', 'Unknown error');
        done();
      },
    });
  });
});
