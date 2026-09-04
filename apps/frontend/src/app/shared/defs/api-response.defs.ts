export interface ApiPaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
};
