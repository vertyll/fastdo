import { TASK_STATUS } from '../model/task-status.enum';
import { TasksListFiltersFormValue } from '../ui/task-list-filters.component';
import { GetAllTasksSearchParams } from './tasks.api.service';

export function getAllTasksSearchParams(
  formValue: TasksListFiltersFormValue & { isUrgent?: boolean },
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
    searchParams.done_like = 'false';
  } else if (formValue.status === TASK_STATUS.DONE) {
    searchParams.done_like = 'true';
  }

  if (formValue.isUrgent) {
    searchParams.is_urgent_like = 'true';
  }

  return searchParams;
}
