import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { RoleEnum } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleEnum[]): CustomDecorator<string> => SetMetadata(ROLES_KEY, roles);