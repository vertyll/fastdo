import { HttpErrorResponse } from '@angular/common/http';

export interface ApiErrorDetails {
  code: string;
  params?: Record<string, unknown>;
}

export function fieldErrorsOf(error: unknown): Record<string, string[]> {
  const data = (error as HttpErrorResponse)?.error?.data;
  if (!data || typeof data !== 'object' || 'code' in data) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(data as Record<string, unknown>).map(([field, message]) => [field, [String(message)]]),
  );
}

export function errorKeyOf(error: unknown): string | null {
  const body = (error as HttpErrorResponse)?.error;
  const code = body?.data?.code;
  if (typeof code === 'string') {
    return code;
  }
  return typeof body?.message === 'string' && body.message ? body.message : null;
}
