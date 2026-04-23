import { FilterModel } from '../../defs/filter.defs';

export class SavePartial {
  public static readonly type = '[Filters] Save Partial';
  constructor(public payload: { type: string; value: FilterModel }) {}
}

export class ClearPartial {
  public static readonly type = '[Filters] Clear Partial';
  constructor(public payload: { type: string; keys: string[] }) {}
}

export class ClearFilter {
  public static readonly type = '[Filters] Clear Filter';
  constructor(public payload: { type: string }) {}
}
