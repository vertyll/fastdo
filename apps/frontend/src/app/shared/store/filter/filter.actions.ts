export class SavePartial {
  public static readonly type = '[Filter] Save Partial';
  constructor(
    public payload: { type: string; value: { [key: string]: any } },
  ) {}
}

export class ClearFilter {
  public static readonly type = '[Filter] Clear Filter';
  constructor(public payload: { type: string }) {}
}

export class ClearPartial {
  public static readonly type = '[Filter] Clear Partial';
  constructor(public payload: { type: string; keys: string[] }) {}
}
