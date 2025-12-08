import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserService } from '../../../user/data-access/user.service';
import { User } from '../../../user/models/User';
import * as UserActions from './user.actions';

export interface UserStateModel {
  user: User;
  loading: boolean;
  error: string | null;
}

@State<UserStateModel>({
  name: 'user',
  defaults: {
    user: {} as User,
    loading: false,
    error: null,
  },
})
@Injectable()
export class UserState {
  constructor(private readonly userService: UserService) {}

  @Action(UserActions.GetCurrentUser)
  getCurrentUser(ctx: StateContext<UserStateModel>): Observable<any> {
    ctx.patchState({ loading: true, error: null });

    return this.userService.getCurrentUser().pipe(
      tap(response => {
        ctx.dispatch(new UserActions.SetUser(response.data));
      }),
      catchError(error => {
        ctx.dispatch(new UserActions.SetError(error.error?.message || 'Error fetching user'));
        throw error;
      }),
    );
  }

  @Action(UserActions.UpdateUserProfile)
  updateProfile(ctx: StateContext<UserStateModel>, { payload }: UserActions.UpdateUserProfile): Observable<any> {
    ctx.patchState({ loading: true, error: null });

    return this.userService.updateProfile(payload).pipe(
      tap(response => {
        ctx.dispatch(new UserActions.SetUser(response.data));
      }),
      catchError(error => {
        ctx.dispatch(new UserActions.SetError(error.error?.message || 'Error updating profile'));
        throw error;
      }),
    );
  }

  @Action(UserActions.SetUser)
  setUser(ctx: StateContext<UserStateModel>, { payload }: UserActions.SetUser): void {
    ctx.patchState({
      user: payload,
      loading: false,
      error: null,
    });
  }

  @Action(UserActions.ClearUser)
  clearUser(ctx: StateContext<UserStateModel>): void {
    ctx.setState({
      user: {} as User,
      loading: false,
      error: null,
    });
  }

  @Action(UserActions.SetError)
  setError(ctx: StateContext<UserStateModel>, { payload }: UserActions.SetError): void {
    ctx.patchState({
      error: payload,
      loading: false,
    });
  }
}
