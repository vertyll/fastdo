import { Role } from '../enums/role.enum';

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
}

export interface AuthState {
  isLoggedIn: boolean;
  roles: Role[] | null;
}
