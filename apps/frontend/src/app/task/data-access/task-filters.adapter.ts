import { PaginationParams, TasksListFiltersConfig } from '../../shared/defs/filter.defs';
import { GetAllTasksSearchParams, TaskSortFieldEnum } from '../defs/task.defs';

export function getAllTasksSearchParams(
  params: Partial<TasksListFiltersConfig & PaginationParams>,
): GetAllTasksSearchParams {
  return {
    ...(params.searchTerm ? { searchTerm: params.searchTerm } : {}),
    ...(params.priority ? { priority: params.priority } : {}),
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.statusId ? { statusId: params.statusId } : {}),
    ...(params.assigneeId ? { assigneeId: params.assigneeId } : {}),
    onlyActive: params.onlyActive ?? true,
    sortBy: params.sortBy ?? TaskSortFieldEnum.CREATED_AT,
    sortDescending: params.sortDescending ?? true,
    page: params.page ?? 0,
    size: params.pageSize ?? 10,
  };
}
