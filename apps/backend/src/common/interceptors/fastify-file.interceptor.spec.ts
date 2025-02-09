import { BadRequestException, CallHandler, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { I18nContext } from 'nestjs-i18n';
import { of } from 'rxjs';
import { FastifyFileInterceptor } from './fastify-file.interceptor';

describe('FastifyFileInterceptor', () => {
  let interceptor: FastifyFileInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockI18n: I18nContext<unknown>;
  let mockGetRequest: jest.Mock;

  beforeEach(() => {
    mockI18n = {
      t: jest.fn().mockReturnValue('translated message'),
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

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should throw error when I18nContext is not available', async () => {
    jest.spyOn(I18nContext, 'current').mockReturnValue(undefined);

    await expect(interceptor.intercept(mockExecutionContext, mockCallHandler))
      .rejects
      .toThrow('I18nContext not available');
  });

  it('should throw BadRequestException when file processing fails', async () => {
    const mockRequest = {
      parts: jest.fn().mockImplementation(() => {
        throw { code: 'FST_REQ_FILE_TOO_LARGE', part: { file: { bytesRead: 5242880 }, fieldname: 'testFile' } };
      }),
    } as unknown as FastifyRequest;

    mockGetRequest.mockReturnValue(mockRequest);

    await expect(interceptor.intercept(mockExecutionContext, mockCallHandler))
      .rejects
      .toThrow(BadRequestException);

    expect(mockI18n.t).toHaveBeenCalledWith('messages.File.errors.fileTooLarge', { args: { maxSize: '5.00MB' } });
  });

  it('should process form data and call next handler', async () => {
    const mockFile = {
      type: 'file',
      fieldname: 'testFile',
      file: {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          next: jest.fn().mockResolvedValue({ done: true }),
        }),
      },
    };

    const mockRequest = {
      parts: jest.fn().mockReturnValue((async function*() {
        yield mockFile;
      })()),
    } as unknown as FastifyRequest;

    mockGetRequest.mockReturnValue(mockRequest);

    await interceptor.intercept(mockExecutionContext, mockCallHandler);

    expect(mockRequest.body).toHaveProperty('testFile');
    expect(mockCallHandler.handle).toHaveBeenCalled();
  });

  it('should handle form data processing errors gracefully', async () => {
    const mockRequest = {
      parts: jest.fn().mockReturnValue((async function*() {
        throw new Error('Form data error');
      })()),
    } as unknown as FastifyRequest;

    mockGetRequest.mockReturnValue(mockRequest);

    await expect(interceptor.intercept(mockExecutionContext, mockCallHandler))
      .rejects
      .toThrow(BadRequestException);

    expect(mockI18n.t).toHaveBeenCalledWith('messages.File.errors.fileProcessingError');
  });
});
