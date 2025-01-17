import { Selector, createSelector } from '@ngxs/store';
import { FilterModel, FilterStateModel } from '../../types/filter.type';
import { FiltersState } from './filter.state';

export class FiltersSelectors {
  @Selector([FiltersState])
  static getState(state: FilterStateModel): FilterStateModel {
    return state;
  }

  static getFiltersByType(type: string): (state: FilterStateModel) => FilterModel {
    return createSelector(
      [FiltersState],
      (state: FilterStateModel): FilterModel => state[type] || {},
    );
  }
}
