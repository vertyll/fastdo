export interface FilterValue {
  id: string;
  value: string;
}

export interface FilterMetadata {
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'select'
    | 'editableMultiSelect'
    | 'checkSelect';
  formControlName: string;
  labelKey: string;
  defaultValue?: any;
  options?: { value: any; label: string }[];
  multiselectOptions?: { id: any; name: string }[];
  maxSelectedItems?: number;
  minTermLength?: number;
  allowAddTag?: boolean;
}
