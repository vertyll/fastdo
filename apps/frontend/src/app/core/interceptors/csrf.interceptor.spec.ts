import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from 'src/environments/environment';
import { csrfInterceptor } from './csrf.interceptor';

const HEADER = 'X-XSRF-TOKEN';
const SESSION = `${environment.apiUrl}/auth/session`;
const TASKS = `${environment.apiUrl}/tasks`;

describe('csrfInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([csrfInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  function receiveToken(token: string): void {
    http.get(SESSION).subscribe();
    backend.expectOne(SESSION).flush(null, { headers: { [HEADER]: token } });
  }

  function handOver(request: TestRequest, token: string | null): void {
    request.flush(null, token === null ? {} : { headers: { [HEADER]: token } });
  }

  function refuse(request: TestRequest, code: string): void {
    request.flush(
      { type: `urn:veds:error:${code}`, title: 'Forbidden', status: 403, code },
      { status: 403, statusText: 'Forbidden' },
    );
  }

  function outcomeOf(write: Observable<unknown>): { value?: unknown; error?: HttpErrorResponse } {
    const outcome: { value?: unknown; error?: HttpErrorResponse } = {};
    write.subscribe({
      next: value => (outcome.value = value),
      error: (error: HttpErrorResponse) => (outcome.error = error),
    });
    return outcome;
  }

  it('sends the token the gateway handed over with a write to the gateway', () => {
    receiveToken('issued');

    http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe();

    expect(backend.expectOne(`${environment.apiUrl}/auth/logout`).request.headers.get(HEADER)).toBe('issued');
  });

  it('sends the latest token the gateway handed over', () => {
    receiveToken('first');
    receiveToken('second');

    http.delete(`${TASKS}/1`).subscribe();

    expect(backend.expectOne(`${TASKS}/1`).request.headers.get(HEADER)).toBe('second');
  });

  it('sends no token with a read', () => {
    receiveToken('issued');

    http.get(TASKS).subscribe();

    expect(backend.expectOne(TASKS).request.headers.has(HEADER)).toBe(false);
  });

  it('never sends the token to another address', () => {
    receiveToken('issued');

    http.put('https://storage.example/upload', {}).subscribe();

    expect(backend.expectOne('https://storage.example/upload').request.headers.has(HEADER)).toBe(false);
  });

  it('asks the gateway for a token before the first write when none was handed over yet', () => {
    http.post(TASKS, {}).subscribe();

    const session = backend.expectOne(SESSION);
    expect(session.request.withCredentials).toBe(true);
    backend.expectNone(TASKS);
    handOver(session, 'fetched');

    expect(backend.expectOne(TASKS).request.headers.get(HEADER)).toBe('fetched');
  });

  it('sends the first write without a token when the gateway hands none over', () => {
    http.post(TASKS, {}).subscribe();

    handOver(backend.expectOne(SESSION), null);

    expect(backend.expectOne(TASKS).request.headers.has(HEADER)).toBe(false);
  });

  it('sends a write refused for its token once more, with a fresh token', () => {
    receiveToken('stale');
    const outcome = outcomeOf(http.post(TASKS, {}));

    refuse(backend.expectOne(TASKS), 'common.csrf_token_invalid');
    handOver(backend.expectOne(SESSION), 'fresh');
    const retried = backend.expectOne(TASKS);
    expect(retried.request.headers.get(HEADER)).toBe('fresh');
    retried.flush({ id: '1' });

    expect(outcome).toEqual({ value: { id: '1' } });
  });

  it('lets a second refusal through to the caller', () => {
    receiveToken('stale');
    const outcome = outcomeOf(http.post(TASKS, {}));

    refuse(backend.expectOne(TASKS), 'common.csrf_token_invalid');
    handOver(backend.expectOne(SESSION), 'fresh');
    refuse(backend.expectOne(TASKS), 'common.csrf_token_invalid');

    backend.expectNone(SESSION);
    expect(outcome.error?.status).toBe(403);
  });

  it('lets the refusal through when the gateway hands no fresh token over', () => {
    receiveToken('stale');
    const outcome = outcomeOf(http.post(TASKS, {}));

    refuse(backend.expectOne(TASKS), 'common.csrf_token_invalid');
    backend.expectOne(SESSION).flush(null, { status: 503, statusText: 'Service Unavailable' });

    backend.expectNone(TASKS);
    expect(outcome.error?.error.code).toBe('common.csrf_token_invalid');
  });

  it('does not retry a write refused for another reason', () => {
    receiveToken('issued');
    const outcome = outcomeOf(http.post(TASKS, {}));

    refuse(backend.expectOne(TASKS), 'common.access_denied');

    backend.expectNone(SESSION);
    expect(outcome.error?.error.code).toBe('common.access_denied');
  });

  it('shares one refresh between writes refused together', () => {
    receiveToken('stale');
    http.post(TASKS, { title: 'a' }).subscribe();
    http.post(TASKS, { title: 'b' }).subscribe();
    const [first, second] = backend.match(TASKS);

    refuse(first, 'common.csrf_token_invalid');
    refuse(second, 'common.csrf_token_invalid');
    handOver(backend.expectOne(SESSION), 'fresh');

    const retried = backend.match(TASKS);
    expect(retried.map(request => request.request.headers.get(HEADER))).toEqual(['fresh', 'fresh']);
  });

  it('retries with a token another write already refreshed, without asking again', () => {
    receiveToken('stale');
    http.post(TASKS, { title: 'a' }).subscribe();
    http.post(TASKS, { title: 'b' }).subscribe();
    const [first, second] = backend.match(TASKS);

    refuse(first, 'common.csrf_token_invalid');
    handOver(backend.expectOne(SESSION), 'fresh');
    refuse(second, 'common.csrf_token_invalid');

    backend.expectNone(SESSION);
    const retried = backend.match(TASKS);
    expect(retried.map(request => request.request.headers.get(HEADER))).toEqual(['fresh', 'fresh']);
  });
});
