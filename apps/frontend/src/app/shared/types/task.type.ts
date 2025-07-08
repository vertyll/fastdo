/*
 * Type
 */
export type TasksListViewMode = 'kanban' | 'list';

export type TaskUpdatePayload = {
  description?: string;
  additionalDescription?: string;
  priceEstimation?: number;
  workedTime?: number;
  accessRoleId?: number;
  assignedUserId?: number;
  priorityId?: number;
  categoryId?: number;
  statusId?: number;
};

export type GetAllTasksSearchParams = {
  q: string;
  sortBy: 'dateCreation' | 'dateModification';
  orderBy: 'desc' | 'asc';
  projectId?: number;
  priorityId?: number;
  categoryId?: number;
  statusId?: number;
  accessRoleId?: number;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  page?: number;
  pageSize?: number;
};
