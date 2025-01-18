import { BadRequestException, CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { WrapResponseInterceptor } from './wrap-response.interceptor';

describe('WrapResponseInterceptor', () => {
  let interceptor: WrapResponseInterceptor<unknown>;
  let mockContext: ExecutionContext;
  let mockCallHandler: CallHandler<unknown>;

  beforeEach(() => {
    interceptor = new WrapResponseInterceptor<unknown>();
    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          url: '/test-url',
          method: 'GET',
        }),
        getResponse: jest.fn().mockReturnValue({
          statusCode: 200,
          statusMessage: 'OK',
        }),
      }),
    } as unknown as ExecutionContext;
    mockCallHandler = {
      handle: jest.fn(),
    } as unknown as CallHandler<unknown>;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap the response data in a data property', done => {
    const testData = { test: 'value' };
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: value => {
        expect(value).toEqual({
          data: testData,
          statusCode: 200,
          timestamp: expect.any(String),
          path: '/test-url',
          method: 'GET',
          message: 'OK',
        });
        done();
      },
      error: () => {
        done.fail('Should not throw error');
      },
    });
  });

  it('should handle null response', done => {
    const interceptor = new WrapResponseInterceptor<null>();
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(null));

    interceptor.intercept(mockContext, mockCallHandler as CallHandler<null>).subscribe({
      next: value => {
        expect(value).toEqual({
          data: null,
          statusCode: 200,
          timestamp: expect.any(String),
          path: '/test-url',
          method: 'GET',
          message: 'OK',
        });
        done();
      },
      error: () => {
        done.fail('Should not throw error');
      },
    });
  });

  it('should handle undefined response', done => {
    const interceptor = new WrapResponseInterceptor<undefined>();
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(undefined));

    interceptor.intercept(mockContext, mockCallHandler as CallHandler<undefined>).subscribe({
      next: value => {
        expect(value).toEqual({
          data: undefined,
          statusCode: 200,
          timestamp: expect.any(String),
          path: '/test-url',
          method: 'GET',
          message: 'OK',
        });
        done();
      },
      error: () => {
        done.fail('Should not throw error');
      },
    });
  });

  it('should handle validation errors', done => {
    const validationError = new BadRequestException({
      message: 'Validation failed',
      errors: [
        {
          field: 'email',
          errors: ['email must be an email'],
        },
      ],
    });

    (mockCallHandler.handle as jest.Mock).mockReturnValue(throwError(() => validationError));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => {
        done.fail('Should throw error');
      },
      error: error => {
        expect(error.response).toEqual({
          data: null,
          statusCode: 400,
          timestamp: expect.any(String),
          path: '/test-url',
          method: 'GET',
          message: 'Validation failed',
          errors: {
            message: 'Validation failed',
            errors: [
              {
                field: 'email',
                errors: ['email must be an email'],
              },
            ],
          },
        });
        done();
      },
    });
  });

  it('should handle non-validation errors', done => {
    const error = new Error('Test error');
    (mockCallHandler.handle as jest.Mock).mockReturnValue(throwError(() => error));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => {
        done.fail('Should throw error');
      },
      error: error => {
        expect(error.response).toEqual({
          data: null,
          statusCode: 500,
          timestamp: expect.any(String),
          path: '/test-url',
          method: 'GET',
          message: 'Test error',
        });
        expect(error.response.errors).toBeUndefined();
        done();
      },
    });
  });
});
