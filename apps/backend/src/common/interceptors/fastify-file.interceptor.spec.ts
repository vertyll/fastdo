import { BadRequestException, CallHandler, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { I18nContext } from 'nestjs-i18n';
import { firstValueFrom, of } from 'rxjs';
import { FastifyFileInterceptor } from './fastify-file.interceptor';

describe('FastifyFileInterceptor', () => {
  let interceptor: FastifyFileInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockI18n: I18nContext<unknown>;
  let mockGetRequest: jest.Mock;

  beforeEach(() => {
    mockI18n = {
      t: jest.fn((_key, _args) => 'translated message'),
    } as any;

    mockGetRequest = jest.fn();

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: mockGetRequest,
      }),
    } as unknown as ExecutionContext;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    };

    jest.spyOn(I18nContext, 'current').mockReturnValue(mockI18n);
    interceptor = new FastifyFileInterceptor('testFile');
  });

  async function interceptAndGetError(request: FastifyRequest): Promise<any> {
    mockGetRequest.mockReturnValue(request);
    const observable = await interceptor.intercept(mockExecutionContext, mockCallHandler);
    return firstValueFrom(observable).catch(err => {
      throw err;
    });
  }

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should throw error when I18nContext is not available', async () => {
    jest.spyOn(I18nContext, 'current').mockReturnValue(undefined);

    await expect(interceptor.intercept(mockExecutionContext, mockCallHandler)).rejects.toThrow(
      'I18nContext not available',
    );
  });

  it('should throw BadRequestException when file processing fails with FST_REQ_FILE_TOO_LARGE', async () => {
    const mockRequest = {
      parts: jest.fn().mockImplementation(() => {
        throw { code: 'FST_REQ_FILE_TOO_LARGE' };
      }),
    } as unknown as FastifyRequest;

    await expect(interceptAndGetError(mockRequest)).rejects.toThrow(BadRequestException);
    expect(mockI18n.t).toHaveBeenCalledWith('messages.File.errors.fileProcessingError');
  });

  it('should process form data and call next handler', async () => {
    const mockFile = {
      type: 'file',
      fieldname: 'testFile',
      filename: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      file: (async function* () {})(),
      headers: { 'content-length': '0' },
    };

    const mockRequest = {
      parts: jest.fn().mockReturnValue(
        (async function* () {
          yield mockFile;
        })(),
      ),
    } as unknown as FastifyRequest;

    mockGetRequest.mockReturnValue(mockRequest);

    await interceptor.intercept(mockExecutionContext, mockCallHandler);

    expect(mockRequest.body).toHaveProperty('testFile');
    expect(mockCallHandler.handle).toHaveBeenCalled();
  });

  it('should handle form data processing errors gracefully', async () => {
    const mockRequest = {
      parts: jest.fn().mockReturnValue(
        (async function* () {
          throw new Error('Form data error');
        })(),
      ),
    } as unknown as FastifyRequest;

    await expect(interceptAndGetError(mockRequest)).rejects.toThrow(BadRequestException);
    expect(mockI18n.t).not.toHaveBeenCalledWith('messages.File.errors.fileProcessingError');
  });

  it('should handle generic errors without specific error codes', async () => {
    const mockRequest = {
      parts: jest.fn().mockReturnValue(
        (async function* () {
          throw new Error('Generic processing error');
        })(),
      ),
    } as unknown as FastifyRequest;

    await expect(interceptAndGetError(mockRequest)).rejects.toThrow(BadRequestException);
    expect(mockI18n.t).not.toHaveBeenCalledWith('messages.File.errors.fileProcessingError');
  });

  it('should use translation for errors without message', async () => {
    const mockRequest = {
      parts: jest.fn().mockReturnValue(
        (async function* () {
          const error = new Error('');
          error.message = '';
          throw error;
        })(),
      ),
    } as unknown as FastifyRequest;

    await expect(interceptAndGetError(mockRequest)).rejects.toThrow(BadRequestException);
    expect(mockI18n.t).toHaveBeenCalledWith('messages.File.errors.fileProcessingError');
  });

  it('should handle errors that are already BadRequestException', async () => {
    const originalError = new BadRequestException('Already a BadRequestException');

    const mockRequest = {
      parts: jest.fn().mockReturnValue(
        (async function* () {
          throw originalError;
        })(),
      ),
    } as unknown as FastifyRequest;

    await expect(interceptAndGetError(mockRequest)).rejects.toThrow(originalError);
    expect(mockI18n.t).not.toHaveBeenCalledWith('messages.File.errors.fileProcessingError');
  });
});
