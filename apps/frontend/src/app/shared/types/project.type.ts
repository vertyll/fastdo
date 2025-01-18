/*
 * Type
 */
export type GetAllProjectsSearchParams = {
  q: string;
  sortBy: 'dateCreation' | 'name' | 'dateModification';
  orderBy: 'desc' | 'asc';
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  page?: number;
  pageSize?: number;
};
