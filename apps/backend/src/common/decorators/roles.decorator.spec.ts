import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../enums/role.enum';
import { ROLES_KEY, Roles } from './roles.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Roles Decorator', () => {
  it('should set metadata with roles key and provided roles', () => {
    const roles = [RoleEnum.Admin, RoleEnum.User];
    Roles(...roles);
    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, roles);
  });

  it('should accept single role', () => {
    Roles(RoleEnum.Admin);
    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, [RoleEnum.Admin]);
  });

  it('should accept multiple roles', () => {
    Roles(RoleEnum.Admin, RoleEnum.User, RoleEnum.Manager);
    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, [RoleEnum.Admin, RoleEnum.User, RoleEnum.Manager]);
  });

  it('should export correct ROLES_KEY value', () => {
    expect(ROLES_KEY).toBe('roles');
  });
});
