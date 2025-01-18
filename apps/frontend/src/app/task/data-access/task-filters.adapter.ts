import { PaginationParams, TasksListFiltersConfig } from 'src/app/shared/types/filter.type';
import { TASK_STATUS } from '../../shared/enums/task-status.enum';
import { GetAllTasksSearchParams } from '../../shared/types/task.type';

export function getAllTasksSearchParams(
  params: Partial<TasksListFiltersConfig & { isUrgent?: boolean; } & PaginationParams>,
): GetAllTasksSearchParams {
  let searchParams: GetAllTasksSearchParams = {
    q: params.q || '',
    sortBy: (params.sortBy as 'dateCreation' | undefined) || 'dateCreation',
    orderBy: params.orderBy || 'desc',
    createdFrom: params.createdFrom || '',
    createdTo: params.createdTo || '',
    updatedFrom: params.updatedFrom || '',
    updatedTo: params.updatedTo || '',
    page: params.page || 0,
    pageSize: params.pageSize || 10,
  };

  if (params.status === TASK_STATUS.TODO) {
    searchParams.is_done = 'false';
  } else if (params.status === TASK_STATUS.DONE) {
    searchParams.is_done = 'true';
  }

  if (params.isUrgent) {
    searchParams.is_urgent = 'true';
  }

  return searchParams;
}
