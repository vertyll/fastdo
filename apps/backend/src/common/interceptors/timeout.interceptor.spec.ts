import { CallHandler, ExecutionContext, RequestTimeoutException } from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { TimeoutInterceptor } from './timeout.interceptor';

describe('TimeoutInterceptor', () => {
  let interceptor: TimeoutInterceptor;
  let mockContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new TimeoutInterceptor();
    mockContext = {} as ExecutionContext;
    mockCallHandler = {
      handle: jest.fn(),
    } as unknown as CallHandler;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should not throw error if response is received in time', done => {
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of('response'));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: value => {
        expect(value).toBe('response');
        done();
      },
      error: () => {
        done.fail('Should not throw error');
      },
    });
  });

  it('should throw RequestTimeoutException if response exceeds timeout limit', done => {
    (mockCallHandler.handle as jest.Mock).mockReturnValue(new Observable(() => {}));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => {
        done.fail('Should not emit value');
      },
      error: error => {
        expect(error).toBeInstanceOf(RequestTimeoutException);
        done();
      },
    });
  });

  it('should pass other errors', done => {
    const testError = new Error('Test error');
    (mockCallHandler.handle as jest.Mock).mockReturnValue(throwError(() => testError));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => {
        done.fail('Should not emit value');
      },
      error: error => {
        expect(error).toBe(testError);
        done();
      },
    });
  });
});
