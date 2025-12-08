import { FilterModel } from '../../types/filter.type';

export class SavePartial {
  static readonly type = '[Filters] Save Partial';
  constructor(public payload: { type: string; value: FilterModel }) {}
}

export class ClearPartial {
  static readonly type = '[Filters] Clear Partial';
  constructor(public payload: { type: string; keys: string[] }) {}
}

export class ClearFilter {
  static readonly type = '[Filters] Clear Filter';
  constructor(public payload: { type: string }) {}
}
