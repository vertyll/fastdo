import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { ROLES_KEY, Roles } from './roles.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Roles Decorator', () => {
  it('should set metadata with roles key and provided roles', () => {
    const roles = [Role.Admin, Role.User];
    Roles(...roles);
    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, roles);
  });

  it('should accept single role', () => {
    Roles(Role.Admin);
    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, [Role.Admin]);
  });

  it('should accept multiple roles', () => {
    Roles(Role.Admin, Role.User, Role.Manager);
    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, [Role.Admin, Role.User, Role.Manager]);
  });

  it('should export correct ROLES_KEY value', () => {
    expect(ROLES_KEY).toBe('roles');
  });
});
