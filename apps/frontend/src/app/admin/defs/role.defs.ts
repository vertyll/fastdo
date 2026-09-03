export type RoleScope = 'GLOBAL' | 'PROJECT';

export interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  unrestricted: boolean;
  system: boolean;
  scope: RoleScope;
  version: number | null;
}

export interface Permission {
  id: number;
  name: string;
  module: string;
  scope: RoleScope;
  description: string | null;
  grantedByRoles: string[];
}

export interface PermissionModule {
  module: string;
  permissions: Permission[];
}

export interface CreateRolePayload {
  name: string;
  description: string | null;
  permissions: string[];
  scope: RoleScope;
}

export interface UpdateRolePayload {
  description: string | null;
  permissions: string[];
}

export interface AdminUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  version: number | null;
}
