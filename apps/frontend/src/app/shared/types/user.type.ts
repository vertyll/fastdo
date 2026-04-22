import { User } from '../../user/models/User';

export interface UserStateModel {
  user: User;
  loading: boolean;
  error: string | null;
}
