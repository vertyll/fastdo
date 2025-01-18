/*
 * Interface
 */
export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
}

export interface ApiPaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

/*
 * Type
 */
export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
