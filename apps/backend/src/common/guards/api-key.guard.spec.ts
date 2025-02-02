import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { ApiKeyGuard } from './api-key.guard';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let reflector: jest.Mocked<Reflector>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    } as any;
    configService = {
      get: jest.fn(),
    } as any;

    guard = new ApiKeyGuard(reflector, configService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if isPublic is true', () => {
    reflector.get.mockReturnValue(true);
    const context = {
      getHandler: jest.fn(),
    } as any;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should check API key if isPublic is false', () => {
    reflector.get.mockReturnValue(false);
    configService.get.mockReturnValue('test-api-key');
    const context = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            'x-api-key': 'test-api-key',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access if API key is incorrect', () => {
    reflector.get.mockReturnValue(false);
    configService.get.mockReturnValue('correct-api-key');
    const context = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            'x-api-key': 'incorrect-api-key',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(false);
  });
});
