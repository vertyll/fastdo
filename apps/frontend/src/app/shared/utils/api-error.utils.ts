import { HttpErrorResponse } from '@angular/common/http';

/**
 * An RFC 9457 problem document, as every service answers a refusal.
 *
 * `code` is the service's own catalogue key, carried as an extension member so a
 * reader looks up its translation without taking `type` apart. `fields` is present
 * only when the request was refused for its contents.
 */
export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  instance?: string;
  code: string;
  params?: Record<string, unknown>;
  fields?: Record<string, string>;
}

function problemOf(error: unknown): ProblemDetail | null {
  const body = (error as HttpErrorResponse)?.error;
  return body && typeof body === 'object' && typeof body.code === 'string' ? (body as ProblemDetail) : null;
}

export function fieldErrorsOf(error: unknown): Record<string, string[]> {
  const fields = problemOf(error)?.fields;
  if (!fields) {
    return {};
  }
  return Object.fromEntries(Object.entries(fields).map(([field, message]) => [field, [String(message)]]));
}

export function errorKeyOf(error: unknown): string | null {
  return problemOf(error)?.code ?? null;
}

export function errorParamsOf(error: unknown): Record<string, unknown> {
  return problemOf(error)?.params ?? {};
}
