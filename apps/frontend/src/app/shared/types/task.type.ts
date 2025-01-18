/*
 * Type
 */
export type TasksListViewMode = 'kanban' | 'list';

export type TaskUpdatePayload = {
  isDone?: boolean;
  name?: string;
  isUrgent?: boolean;
};

export type GetAllTasksSearchParams = {
  q: string;
  sortBy: 'dateCreation';
  orderBy: 'desc' | 'asc';
  is_done?: 'true' | 'false' | '';
  is_urgent?: 'true' | '';
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  page?: number;
  pageSize?: number;
};
