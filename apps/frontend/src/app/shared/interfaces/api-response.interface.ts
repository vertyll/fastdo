export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
}
