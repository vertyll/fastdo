import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let clsService: ClsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: new Reflector(),
        },
        {
          provide: ClsService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = moduleRef.get<JwtAuthGuard>(JwtAuthGuard);
    clsService = moduleRef.get<ClsService>(ClsService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it("should extend AuthGuard with 'jwt' strategy", () => {
    expect(guard).toBeInstanceOf(AuthGuard('jwt'));
  });

  it('should set user in ClsService after successful authentication', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 1,
            email: 'test@example.com',
            roles: ['user'],
          },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    };

    const mockCanActivate = jest.spyOn(AuthGuard('jwt').prototype, 'canActivate').mockImplementation(() => true);

    await guard.canActivate(context as any);

    expect(clsService.set).toHaveBeenCalledWith('user', {
      userId: 1,
      userEmail: 'test@example.com',
      userRoles: ['user'],
    });

    mockCanActivate.mockRestore();
  });

  it('should not set user in ClsService if authentication fails', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    };

    const mockCanActivate = jest.spyOn(AuthGuard('jwt').prototype, 'canActivate').mockImplementation(() => false);

    await guard.canActivate(context as any);

    expect(clsService.set).not.toHaveBeenCalled();

    mockCanActivate.mockRestore();
  });
});
