import { FilterType } from '../enums/filter.enum';
import { TASK_STATUS, TaskStatus } from '../enums/task-status.enum';

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
  type: FilterType;
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
  status: TaskStatus;
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
    type: FilterType.Text,
    formControlName: 'q',
    labelKey: 'Filters.search',
  },
  {
    type: FilterType.Select,
    formControlName: 'status',
    labelKey: 'Filters.status',
    defaultValue: TASK_STATUS.ALL,
    options: [
      { value: TASK_STATUS.ALL, label: 'Filters.statusAll' },
      { value: TASK_STATUS.TODO, label: 'Filters.statusTodo' },
      { value: TASK_STATUS.DONE, label: 'Filters.statusDone' },
    ],
  },
  {
    type: FilterType.Select,
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
    type: FilterType.Select,
    formControlName: 'orderBy',
    labelKey: 'Filters.orderBy',
    defaultValue: 'desc',
    options: [
      { value: 'desc', label: 'Filters.orderByDesc' },
      { value: 'asc', label: 'Filters.orderByAsc' },
    ],
  },
  {
    type: FilterType.Date,
    formControlName: 'createdFrom',
    labelKey: 'Filters.createdFrom',
  },
  {
    type: FilterType.Date,
    formControlName: 'createdTo',
    labelKey: 'Filters.createdTo',
  },
  {
    type: FilterType.Date,
    formControlName: 'updatedFrom',
    labelKey: 'Filters.updatedFrom',
  },
  {
    type: FilterType.Date,
    formControlName: 'updatedTo',
    labelKey: 'Filters.updatedTo',
  },
];

/*
 * Const
 */
export const PROJECT_LIST_FILTERS: FilterMetadata[] = [
  {
    type: FilterType.Text,
    formControlName: 'q',
    labelKey: 'Filters.search',
  },
  {
    type: FilterType.Select,
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
    type: FilterType.Select,
    formControlName: 'orderBy',
    labelKey: 'Filters.orderBy',
    defaultValue: 'desc',
    options: [
      { value: 'desc', label: 'Filters.orderByDesc' },
      { value: 'asc', label: 'Filters.orderByAsc' },
    ],
  },
  {
    type: FilterType.Date,
    formControlName: 'createdFrom',
    labelKey: 'Filters.createdFrom',
  },
  {
    type: FilterType.Date,
    formControlName: 'createdTo',
    labelKey: 'Filters.createdTo',
  },
  {
    type: FilterType.Date,
    formControlName: 'updatedFrom',
    labelKey: 'Filters.updatedFrom',
  },
  {
    type: FilterType.Date,
    formControlName: 'updatedTo',
    labelKey: 'Filters.updatedTo',
  },
];
