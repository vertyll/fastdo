import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { FILTERS_STORAGE_KEY } from '../../../app.contansts';
import { FilterStateModel } from '../../types/filter.type';
import { ClearFilter, ClearPartial, SavePartial } from './filter.actions';

function getStoredState(): FilterStateModel {
  try {
    const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

@State<FilterStateModel>({
  name: 'filters',
  defaults: getStoredState(),
})
@Injectable()
export class FiltersState {
  @Selector()
  static getState(state: FilterStateModel): FilterStateModel {
    return state;
  }

  private syncToStorage(state: FilterStateModel): void {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(state));
  }

  @Action(SavePartial)
  public savePartial({ getState, setState }: StateContext<FilterStateModel>, { payload }: SavePartial): void {
    const state: FilterStateModel = getState();
    const newState = {
      ...state,
      [payload.type]: {
        ...(state[payload.type] || {}),
        ...payload.value,
      },
    };

    setState(newState);
    this.syncToStorage(newState);
  }

  @Action(ClearPartial)
  public clearPartial({ getState, setState }: StateContext<FilterStateModel>, { payload }: ClearPartial): void {
    const state = getState();
    if (!payload.type) return;

    const currentFilters = { ...(state[payload.type] || {}) };
    payload.keys.forEach(key => delete currentFilters[key]);

    const newState = {
      ...state,
      [payload.type]: currentFilters,
    };

    setState(newState);
    this.syncToStorage(newState);
  }

  @Action(ClearFilter)
  public clearFilter({ getState, setState }: StateContext<FilterStateModel>, { payload }: ClearFilter): void {
    if (!payload.type) return;

    const state = getState();
    const { [payload.type]: _removed, ...rest } = state;

    setState(rest);
    this.syncToStorage(rest);
  }
}
