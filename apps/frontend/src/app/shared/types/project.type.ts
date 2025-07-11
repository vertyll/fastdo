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
  typeIds?: number[];
  page?: number;
  pageSize?: number;
};
