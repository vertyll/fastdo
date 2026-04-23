import { Selector, createSelector } from '@ngxs/store';
import { FilterModel, FilterStateModel } from '../../defs/filter.defs';
import { FiltersState } from './filter.state';

export class FiltersSelectors {
  @Selector([FiltersState])
  public static getState(state: FilterStateModel): FilterStateModel {
    return state;
  }

  public static getFiltersByType(type: string): (state: FilterStateModel) => FilterModel {
    return createSelector([FiltersState], (state: FilterStateModel): FilterModel => state[type] || {});
  }
}
