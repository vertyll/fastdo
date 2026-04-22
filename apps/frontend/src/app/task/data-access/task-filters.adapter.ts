import { PaginationParams, TasksListFiltersConfig } from 'src/app/shared/defs/filter.defs';
import { GetAllTasksSearchParams } from '../defs/task.defs';

export function getAllTasksSearchParams(
  params: Partial<TasksListFiltersConfig & PaginationParams>,
): GetAllTasksSearchParams {
  return {
    q: params.q || '',
    priorityIds: params.priorityIds || [],
    categoryIds: params.categoryIds || [],
    statusIds: params.statusIds || [],
    assignedUserIds: params.assignedUserIds || [],
    sortBy: params.sortBy || 'dateCreation',
    orderBy: params.orderBy || 'desc',
    createdFrom: params.createdFrom || '',
    createdTo: params.createdTo || '',
    updatedFrom: params.updatedFrom || '',
    updatedTo: params.updatedTo || '',
    page: params.page || 0,
    pageSize: params.pageSize || 10,
  };
}
