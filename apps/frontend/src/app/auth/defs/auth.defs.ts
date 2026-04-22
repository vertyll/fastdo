import { RoleEnum } from '../../shared/enums/role.enum';

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

export interface RegisterResponse {
  email: string;
  password: string;
  dateModification: Date | null;
  id: number;
  isActive: boolean;
  dateCreation: Date;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  roles: RoleEnum[] | null;
}
