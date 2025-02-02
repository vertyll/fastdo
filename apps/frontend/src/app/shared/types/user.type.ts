import { User } from '../../user/models/User';

/*
 * Type
 */

export interface UserStateModel {
  user: User;
  loading: boolean;
  error: string | null;
}
