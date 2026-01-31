import { Injectable, computed, inject, signal } from '@angular/core';
import { LOADING_STATE_VALUE } from 'src/app/shared/types/list-state.type';
import { User } from '../models/User';
import { UserApiService } from './user.api.service';

@Injectable({ providedIn: 'root' })
export class UserStateService {
  private readonly apiService = inject(UserApiService);

  private readonly userSignal = signal<User>({} as User);

  public user = computed(() => this.userSignal());
  public state = computed(() => {
    if (this.apiService.$idle()) {
      return LOADING_STATE_VALUE.IDLE;
    } else if (this.apiService.$loading()) {
      return LOADING_STATE_VALUE.LOADING;
    } else if (this.apiService.$error()) {
      return LOADING_STATE_VALUE.ERROR;
    } else {
      return LOADING_STATE_VALUE.SUCCESS;
    }
  });
  public error = computed(() => this.apiService.$error());

  public setUser(projects: User): void {
    this.userSignal.set(projects);
  }
}
