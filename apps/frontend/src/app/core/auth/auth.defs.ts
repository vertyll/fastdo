import { RoleEnum } from '../../shared/enums/role.enum';

export interface Session {
  userId: string;
  email: string;
  roles: RoleEnum[];
}

export interface AuthState {
  session: Session | null;
  resolved: boolean;
}
