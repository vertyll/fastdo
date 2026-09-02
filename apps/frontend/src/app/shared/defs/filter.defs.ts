import { ProjectSortFieldEnum } from '../../project/defs/project.defs';
import { TaskSortFieldEnum } from '../../task/defs/task.defs';
import { FilterTypeEnum } from '../enums/filter-type.enum';
import { TaskPriorityEnum } from '../enums/task-priority.enum';

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

export type TasksListFiltersConfig = {
  searchTerm?: string;
  priority?: TaskPriorityEnum;
  categoryId?: string;
  statusId?: string;
  assigneeId?: string;
  onlyActive?: boolean;
  sortBy?: TaskSortFieldEnum;
  sortDescending?: boolean;
};

export interface ProjectListFiltersConfig {
  searchTerm?: string;
  typeId?: string;
  onlyActive?: boolean;
  includePublic?: boolean;
  sortBy?: ProjectSortFieldEnum;
  sortDescending?: boolean;
  page?: number;
  pageSize?: number;
}

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export const PROJECT_LIST_FILTERS: FilterMetadata[] = [
  {
    type: FilterTypeEnum.Text,
    formControlName: 'searchTerm',
    labelKey: 'Filters.search',
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'typeId',
    labelKey: 'Filters.projectTypes',
    options: [],
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'sortBy',
    labelKey: 'Filters.sortBy',
    defaultValue: ProjectSortFieldEnum.CREATED_AT,
    options: [
      { value: ProjectSortFieldEnum.CREATED_AT, label: 'Filters.sortByCreatedAt' },
      { value: ProjectSortFieldEnum.UPDATED_AT, label: 'Filters.sortByUpdatedAt' },
      { value: ProjectSortFieldEnum.NAME, label: 'Filters.sortByName' },
    ],
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'sortDescending',
    labelKey: 'Filters.orderBy',
    defaultValue: true,
    options: [
      { value: true, label: 'Filters.orderByDesc' },
      { value: false, label: 'Filters.orderByAsc' },
    ],
  },
];

export const TASKS_LIST_FILTERS: FilterMetadata[] = [
  {
    type: FilterTypeEnum.Text,
    formControlName: 'searchTerm',
    labelKey: 'Filters.search',
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'priority',
    labelKey: 'Filters.priorities',
    options: [
      { value: TaskPriorityEnum.LOW, label: 'Task.priorityLow' },
      { value: TaskPriorityEnum.MEDIUM, label: 'Task.priorityMedium' },
      { value: TaskPriorityEnum.HIGH, label: 'Task.priorityHigh' },
    ],
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'categoryId',
    labelKey: 'Filters.categories',
    options: [],
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'statusId',
    labelKey: 'Filters.statuses',
    options: [],
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'assigneeId',
    labelKey: 'Filters.assignedUsers',
    options: [],
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'sortBy',
    labelKey: 'Filters.sortBy',
    defaultValue: TaskSortFieldEnum.CREATED_AT,
    options: [
      { value: TaskSortFieldEnum.CREATED_AT, label: 'Filters.sortByCreatedAt' },
      { value: TaskSortFieldEnum.UPDATED_AT, label: 'Filters.sortByUpdatedAt' },
      { value: TaskSortFieldEnum.PRIORITY, label: 'Filters.sortByPriority' },
      { value: TaskSortFieldEnum.NAME, label: 'Filters.sortByName' },
    ],
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'sortDescending',
    labelKey: 'Filters.orderBy',
    defaultValue: true,
    options: [
      { value: true, label: 'Filters.orderByDesc' },
      { value: false, label: 'Filters.orderByAsc' },
    ],
  },
];
