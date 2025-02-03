import { RoleEnum } from '../enums/role.enum';

/*
 * Interface
 */
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

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  roles: RoleEnum[] | null;
}
