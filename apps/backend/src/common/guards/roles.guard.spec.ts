import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    rolesGuard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  it('should allow access if no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { roles: [] },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has required roles', () => {
    const requiredRoles: Role[] = [Role.Admin];
    reflector.getAllAndOverride.mockReturnValue(requiredRoles);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { roles: [Role.Admin] },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('should deny access if user does not have required roles', () => {
    const requiredRoles: Role[] = [Role.Admin];
    reflector.getAllAndOverride.mockReturnValue(requiredRoles);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { roles: [Role.User] },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(rolesGuard.canActivate(context)).toBe(false);
  });
});
