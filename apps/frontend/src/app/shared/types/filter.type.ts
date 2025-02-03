import { FilterTypeEnum } from '../enums/filter.enum';
import { TaskStatusEnum } from '../enums/task-status.enum';

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
  options?: { value: any; label: string; }[];
  multiselectOptions?: { id: any; name: string; }[];
  maxSelectedItems?: number;
  minTermLength?: number;
  allowAddTag?: boolean;
}

export interface FilterStateModel extends FilterMap {}

/*
 * Type
 */
export type FilterModel = {
  [key: string]: any;
};

export type TasksListFiltersConfig = {
  q: string;
  status: TaskStatusEnum;
  sortBy: 'dateCreation' | 'dateModification' | 'name';
  orderBy: 'asc' | 'desc';
  createdFrom: string;
  createdTo: string;
  updatedFrom: string;
  updatedTo: string;
};

export type ProjectListFiltersConfig = {
  q: string;
  sortBy: 'dateCreation' | 'dateModification' | 'name';
  orderBy: 'asc' | 'desc';
  createdFrom: string;
  createdTo: string;
  updatedFrom: string;
  updatedTo: string;
};

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export const TASKS_LIST_FILTERS: FilterMetadata[] = [
  {
    type: FilterTypeEnum.Text,
    formControlName: 'q',
    labelKey: 'Filters.search',
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'status',
    labelKey: 'Filters.status',
    defaultValue: TaskStatusEnum.All,
    options: [
      { value: TaskStatusEnum.All, label: 'Filters.statusAll' },
      { value: TaskStatusEnum.Todo, label: 'Filters.statusTodo' },
      { value: TaskStatusEnum.Done, label: 'Filters.statusDone' },
    ],
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'sortBy',
    labelKey: 'Filters.sortBy',
    defaultValue: 'dateCreation',
    options: [
      { value: 'dateCreation', label: 'Filters.sortByCreatedAt' },
      { value: 'dateModification', label: 'Filters.sortByUpdatedAt' },
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
    type: FilterTypeEnum.Select,
    formControlName: 'sortBy',
    labelKey: 'Filters.sortBy',
    defaultValue: 'dateCreation',
    options: [
      { value: 'dateCreation', label: 'Filters.sortByCreatedAt' },
      { value: 'dateModification', label: 'Filters.sortByUpdatedAt' },
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
