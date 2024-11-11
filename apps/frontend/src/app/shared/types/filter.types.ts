import { TASK_STATUS, TaskStatus } from 'src/app/task/enums/task-status.enum';
import { FilterMetadata } from '../interfaces/filter.interface';

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

export const TASKS_LIST_FILTERS: FilterMetadata[] = [
  {
    type: 'text',
    formControlName: 'name',
    labelKey: 'Filters.search',
  },
  {
    type: 'select',
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
    type: 'select',
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
    type: 'select',
    formControlName: 'orderBy',
    labelKey: 'Filters.orderBy',
    defaultValue: 'desc',
    options: [
      { value: 'desc', label: 'Filters.orderByDesc' },
      { value: 'asc', label: 'Filters.orderByAsc' },
    ],
  },
  {
    type: 'date',
    formControlName: 'createdFrom',
    labelKey: 'Filters.createdFrom',
  },
  {
    type: 'date',
    formControlName: 'createdTo',
    labelKey: 'Filters.createdTo',
  },
  {
    type: 'date',
    formControlName: 'updatedFrom',
    labelKey: 'Filters.updatedFrom',
  },
  {
    type: 'date',
    formControlName: 'updatedTo',
    labelKey: 'Filters.updatedTo',
  },
];

export const PROJECT_LIST_FILTERS: FilterMetadata[] = [
  {
    type: 'text',
    formControlName: 'name',
    labelKey: 'Filters.search',
  },
  {
    type: 'select',
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
    type: 'select',
    formControlName: 'orderBy',
    labelKey: 'Filters.orderBy',
    defaultValue: 'desc',
    options: [
      { value: 'desc', label: 'Filters.orderByDesc' },
      { value: 'asc', label: 'Filters.orderByAsc' },
    ],
  },
  {
    type: 'date',
    formControlName: 'createdFrom',
    labelKey: 'Filters.createdFrom',
  },
  {
    type: 'date',
    formControlName: 'createdTo',
    labelKey: 'Filters.createdTo',
  },
  {
    type: 'date',
    formControlName: 'updatedFrom',
    labelKey: 'Filters.updatedFrom',
  },
  {
    type: 'date',
    formControlName: 'updatedTo',
    labelKey: 'Filters.updatedTo',
  },
];
