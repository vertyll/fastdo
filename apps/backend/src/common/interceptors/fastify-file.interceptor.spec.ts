import { MultipartFile } from '@fastify/multipart';
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
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
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

  it('should throw BadRequestException when no file is found', async () => {
    const mockRequest = {
      body: {},
    } as FastifyRequest;

    mockGetRequest.mockReturnValue(mockRequest);

    await expect(interceptor.intercept(mockExecutionContext, mockCallHandler))
      .rejects
      .toThrow(BadRequestException);
  });

  it('should extract file from request body', async () => {
    const mockFile = { fieldname: 'testFile' } as MultipartFile;
    const mockRequest = {
      body: {
        testFile: mockFile,
      },
    } as FastifyRequest;

    mockGetRequest.mockReturnValue(mockRequest);

    await interceptor.intercept(mockExecutionContext, mockCallHandler);

    expect((mockRequest as any).incomingFile).toBe(mockFile);
    expect(mockCallHandler.handle).toHaveBeenCalled();
  });

  it('should extract file using request.file()', async () => {
    const mockFile = { fieldname: 'testFile' } as MultipartFile;
    const mockRequest = {
      file: jest.fn().mockResolvedValue(mockFile),
    } as any;

    mockGetRequest.mockReturnValue(mockRequest);

    await interceptor.intercept(mockExecutionContext, mockCallHandler);

    expect((mockRequest as any).incomingFile).toBe(mockFile);
    expect(mockCallHandler.handle).toHaveBeenCalled();
  });

  it('should extract file from parts', async () => {
    const mockFile = {
      type: 'file',
      fieldname: 'testFile',
    } as MultipartFile;

    const mockRequest = {
      parts: jest.fn().mockReturnValue([mockFile]),
    } as any;

    mockGetRequest.mockReturnValue(mockRequest);

    await interceptor.intercept(mockExecutionContext, mockCallHandler);

    expect((mockRequest as any).incomingFile).toBe(mockFile);
    expect(mockCallHandler.handle).toHaveBeenCalled();
  });

  it('should handle file extraction errors gracefully', async () => {
    const mockRequest = {
      file: jest.fn().mockRejectedValue(new Error('File extraction failed')),
    } as any;

    mockGetRequest.mockReturnValue(mockRequest);

    await expect(interceptor.intercept(mockExecutionContext, mockCallHandler))
      .rejects
      .toThrow(BadRequestException);

    expect(mockI18n.t).toHaveBeenCalled();
  });
});
