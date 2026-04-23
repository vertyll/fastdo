import { Selector } from '@ngxs/store';
import { User, UserStateModel } from '../../../user/defs/user.defs';
import { UserState } from './user.state';

export class UserSelectors {
  @Selector([UserState])
  public static getState(state: UserStateModel): UserStateModel {
    return state;
  }

  @Selector([UserState])
  public static getUser(state: UserStateModel): User {
    return state.user;
  }

  @Selector([UserState])
  public static getLoading(state: UserStateModel): boolean {
    return state.loading;
  }

  @Selector([UserState])
  public static getError(state: UserStateModel): string | null {
    return state.error;
  }
}
