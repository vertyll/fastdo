import { FilterTypeEnum } from '../enums/filter-type.enum';

export interface FilterMap {
  [type: string]: FilterModel;
}

export interface FilterValue {
  id: string;
  value: string;
}

export interface FilterMetadata {
  type: FilterTypeEnum;
  formControlName: string;
  labelKey: string;
  defaultValue?: any;
  options?: { value: any; label: string }[];
  multiselectOptions?: { id: any; name: string }[];
  maxSelectedItems?: number;
  minTermLength?: number;
  allowAddTag?: boolean;
}

export type FilterStateModel = FilterMap;

export type FilterModel = {
  [key: string]: any;
};

export type PaginationParams = {
  page: number;
  pageSize: number;
};
