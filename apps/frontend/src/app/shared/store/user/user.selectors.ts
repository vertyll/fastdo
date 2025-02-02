import { Selector, createSelector } from '@ngxs/store';
import { User } from '../../../user/models/User';
import { UserStateModel } from '../../types/user.type';
import { UserState } from './user.state';

export class UserSelectors {
  @Selector([UserState])
  static getState(state: UserStateModel): UserStateModel {
    return state;
  }

  @Selector([UserState])
  static getUser(state: UserStateModel): User {
    return state.user;
  }

  @Selector([UserState])
  static getLoading(state: UserStateModel): boolean {
    return state.loading;
  }

  @Selector([UserState])
  static getError(state: UserStateModel): string | null {
    return state.error;
  }
}
