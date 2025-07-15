export interface ApiResponseWrapper<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  errors?: any;
}

export interface ApiWrappedResponseOptions {
  status: number;
  description?: string;
  type?: any;
  isArray?: boolean;
  isPaginated?: boolean;
}

export interface ApiErrorResponse {
  message?: string | string[];
  [key: string]: any;
}

export interface ApiPaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore?: boolean;
}
