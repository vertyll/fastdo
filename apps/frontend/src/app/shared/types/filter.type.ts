import { FilterTypeEnum } from '../enums/filter-type.enum';

/*
 * Interface
 */
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

/*
 * Type
 */
export type FilterModel = {
  [key: string]: any;
};

export type TasksListFiltersConfig = {
  q?: string;
  priorityIds?: number[];
  categoryIds?: number[];
  statusIds?: number[];
  assignedUserIds?: number[];
  sortBy?: 'dateCreation' | 'dateModification' | 'description' | 'id';
  orderBy?: 'asc' | 'desc';
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
};

export interface ProjectListFiltersConfig {
  q: string;
  sortBy: 'dateCreation' | 'dateModification' | 'name';
  orderBy: 'asc' | 'desc';
  createdFrom: string;
  createdTo: string;
  updatedFrom: string;
  updatedTo: string;
  typeIds: number[];
  page: number;
  pageSize: number;
}

export type PaginationParams = {
  page: number;
  pageSize: number;
};

/*
 * Const
 */
export const PROJECT_LIST_FILTERS: FilterMetadata[] = [
  {
    type: FilterTypeEnum.Text,
    formControlName: 'q',
    labelKey: 'Filters.search',
  },
  {
    type: FilterTypeEnum.EditableMultiSelect,
    formControlName: 'typeIds',
    labelKey: 'Filters.projectTypes',
    multiselectOptions: [],
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'sortBy',
    labelKey: 'Filters.sortBy',
    defaultValue: 'dateCreation',
    options: [
      { value: 'dateCreation', label: 'Filters.createdFrom' },
      { value: 'dateModification', label: 'Filters.updatedFrom' },
      { value: 'name', label: 'Filters.sortByName' },
    ],
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'orderBy',
    labelKey: 'Filters.orderBy',
    defaultValue: 'desc',
    options: [
      { value: 'desc', label: 'Filters.orderByDesc' },
      { value: 'asc', label: 'Filters.orderByAsc' },
    ],
  },
  {
    type: FilterTypeEnum.Date,
    formControlName: 'createdFrom',
    labelKey: 'Filters.createdFrom',
  },
  {
    type: FilterTypeEnum.Date,
    formControlName: 'createdTo',
    labelKey: 'Filters.createdTo',
  },
  {
    type: FilterTypeEnum.Date,
    formControlName: 'updatedFrom',
    labelKey: 'Filters.updatedFrom',
  },
  {
    type: FilterTypeEnum.Date,
    formControlName: 'updatedTo',
    labelKey: 'Filters.updatedTo',
  },
];

export const TASKS_LIST_FILTERS: FilterMetadata[] = [
  {
    type: FilterTypeEnum.Text,
    formControlName: 'q',
    labelKey: 'Filters.search',
  },
  {
    type: FilterTypeEnum.EditableMultiSelect,
    formControlName: 'priorityIds',
    labelKey: 'Filters.priorities',
    multiselectOptions: [],
  },
  {
    type: FilterTypeEnum.EditableMultiSelect,
    formControlName: 'categoryIds',
    labelKey: 'Filters.categories',
    multiselectOptions: [],
  },
  {
    type: FilterTypeEnum.EditableMultiSelect,
    formControlName: 'statusIds',
    labelKey: 'Filters.statuses',
    multiselectOptions: [],
  },
  {
    type: FilterTypeEnum.EditableMultiSelect,
    formControlName: 'assignedUserIds',
    labelKey: 'Filters.assignedUsers',
    multiselectOptions: [],
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'sortBy',
    labelKey: 'Filters.sortBy',
    defaultValue: 'dateCreation',
    options: [
      { value: 'dateCreation', label: 'Filters.createdFrom' },
      { value: 'dateModification', label: 'Filters.updatedFrom' },
    ],
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'orderBy',
    labelKey: 'Filters.orderBy',
    defaultValue: 'desc',
    options: [
      { value: 'desc', label: 'Filters.orderByDesc' },
      { value: 'asc', label: 'Filters.orderByAsc' },
    ],
  },
  {
    type: FilterTypeEnum.Date,
    formControlName: 'createdFrom',
    labelKey: 'Filters.createdFrom',
  },
  {
    type: FilterTypeEnum.Date,
    formControlName: 'createdTo',
    labelKey: 'Filters.createdTo',
  },
  {
    type: FilterTypeEnum.Date,
    formControlName: 'updatedFrom',
    labelKey: 'Filters.updatedFrom',
  },
  {
    type: FilterTypeEnum.Date,
    formControlName: 'updatedTo',
    labelKey: 'Filters.updatedTo',
  },
];
