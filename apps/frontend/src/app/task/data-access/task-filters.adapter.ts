import { PaginationParams, TasksListFiltersConfig } from 'src/app/shared/types/filter.type';
import { GetAllTasksSearchParams } from '../../shared/types/task.type';

export function getAllTasksSearchParams(
  params: Partial<TasksListFiltersConfig & PaginationParams>,
): GetAllTasksSearchParams {
  let searchParams: GetAllTasksSearchParams = {
    q: params.q || '',
    sortBy: (params.sortBy as 'dateCreation' | 'dateModification' | undefined) || 'dateCreation',
    orderBy: params.orderBy || 'desc',
    createdFrom: params.createdFrom || '',
    createdTo: params.createdTo || '',
    updatedFrom: params.updatedFrom || '',
    updatedTo: params.updatedTo || '',
    page: params.page || 0,
    pageSize: params.pageSize || 10,
  };

  return searchParams;
}
