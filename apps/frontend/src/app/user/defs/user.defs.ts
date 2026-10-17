import { RoleEnum } from '../../shared/enums/role.enum';

export type User = {
  id: number;
  keycloakId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  roles: RoleEnum[];
  permissions: string[];
  avatarFileId: string | null;
  phoneNumber: string | null;
  address: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  version: number | null;
};

/** The reader's second factor, and the credential Keycloak's `delete_credential` removes to turn it off. */
export type SecuritySettings = {
  twoFactorEnabled: boolean;
  configuredFactors: string[];
  twoFactorCredentialId: string | null;
};

export type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
  avatarFileId?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
};

export interface UserStateModel {
  user: User | null;
  loading: boolean;
  error: string | null;
}
