/*
 * Type
 */

export type GetAllTasksSearchParams = {
  q: string;
  sortBy: 'dateCreation' | 'dateModification' | 'description' | 'id';
  orderBy: 'desc' | 'asc';
  priorityIds?: number[];
  categoryIds?: number[];
  statusIds?: number[];
  assignedUserIds?: number[];
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  page?: number;
  pageSize?: number;
};
