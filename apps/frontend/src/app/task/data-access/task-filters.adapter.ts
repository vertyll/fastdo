import { TasksListFiltersConfig } from 'src/app/shared/types/filter.type';
import { TASK_STATUS } from '../enums/task-status.enum';
import { GetAllTasksSearchParams } from './task.api.service';

export function getAllTasksSearchParams(
  formValue: TasksListFiltersConfig & { isUrgent?: boolean },
): GetAllTasksSearchParams {
  let searchParams: GetAllTasksSearchParams = {
    q: formValue.q || '',
    sortBy: (formValue.sortBy as 'dateCreation' | undefined) || 'dateCreation',
    orderBy: formValue.orderBy || 'desc',
    createdFrom: formValue.createdFrom,
    createdTo: formValue.createdTo,
    updatedFrom: formValue.updatedFrom,
    updatedTo: formValue.updatedTo,
  };

  if (formValue.status === TASK_STATUS.TODO) {
    searchParams.is_done = 'false';
  } else if (formValue.status === TASK_STATUS.DONE) {
    searchParams.is_done = 'true';
  }

  if (formValue.isUrgent) {
    searchParams.is_urgent = 'true';
  }

  return searchParams;
}
