import { FilterTypeEnum } from '../../shared/enums/filter-type.enum';
import { FilterMetadata } from '../../shared/defs/filter.defs';
import { TaskPriorityEnum } from '../../shared/enums/task-priority.enum';
import { TaskSortFieldEnum } from './task.defs';

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
