export interface SimpleNameItem {
  id: string;
  name: string;
}

export interface OptionItem extends SimpleNameItem {
  code?: string;
}
