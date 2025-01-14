import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { FilterMap, FilterModel } from '../../types/filter.type';
import { ClearFilter, ClearPartial, SavePartial } from './filter.actions';

const initialState: FilterModel[] = [];

@State<FilterModel[]>({
  name: 'filters',
  defaults: initialState,
})
@Injectable({
  providedIn: 'root',
})
export class FiltersState {
  @Action(SavePartial)
  public savePartial(ctx: StateContext<FilterModel>, { payload }: SavePartial) {
    const currentState = ctx.getState();
    let filter: FilterMap = {};

    if (payload.type) {
      const currentFilters = currentState[payload.type] || {};
      filter[payload.type] = { ...currentFilters, ...payload.value };
      ctx.patchState(filter);
    }
  }

  @Action(ClearPartial)
  public clearPartial(ctx: StateContext<FilterMap>, { payload }: ClearPartial) {
    const currentState = ctx.getState();
    let filter: FilterMap = {};

    if (payload.type) {
      let currentFilters = { ...(currentState[payload.type] || {}) };

      payload.keys.forEach((key: string) => {
        delete currentFilters[key];
      });

      filter[payload.type] = { ...currentFilters };

      ctx.patchState(filter);
    }
  }

  @Action(ClearFilter)
  public clearFilter(ctx: StateContext<FilterMap>, { payload }: ClearFilter) {
    let filter: FilterMap = {};

    if (payload.type) {
      filter[payload.type] = {};
      ctx.patchState(filter);
    }
  }
}
