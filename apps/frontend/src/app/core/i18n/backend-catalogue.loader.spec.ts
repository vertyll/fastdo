import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { environment } from '../../../environments/environment';
import { BackendCatalogueLoader } from './backend-catalogue.loader';

describe('BackendCatalogueLoader', () => {
  let loader: BackendCatalogueLoader;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), BackendCatalogueLoader],
    });
    loader = TestBed.inject(BackendCatalogueLoader);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('merges the interface catalogue with the one the back end owns', async () => {
    const result = loader.getTranslation('pl');
    const merged = new Promise(resolve => result.subscribe(resolve));

    http.expectOne('./i18n/pl.json').flush({ 'Basic.save': 'Zapisz' });
    http.expectOne(`${environment.apiUrl}/translations/pl`).flush({
      data: { language: 'pl', version: '1', entries: { 'task.not_found': 'Nie znaleziono zadania.' } },
      message: 'ok',
      timestamp: '',
    });

    expect(await merged).toEqual({ 'Basic.save': 'Zapisz', 'task.not_found': 'Nie znaleziono zadania.' });
  });

  it('lets the back end win a collision, because it owns the keys it declares', async () => {
    const merged = new Promise(resolve => loader.getTranslation('pl').subscribe(resolve));

    http.expectOne('./i18n/pl.json').flush({ 'common.access_denied': 'stary tekst' });
    http.expectOne(`${environment.apiUrl}/translations/pl`).flush({
      data: { language: 'pl', version: '1', entries: { 'common.access_denied': 'Brak uprawnien.' } },
      message: 'ok',
      timestamp: '',
    });

    expect(await merged).toEqual({ 'common.access_denied': 'Brak uprawnien.' });
  });

  it('keeps the interface usable when the catalogue service is unreachable', async () => {
    const merged = new Promise(resolve => loader.getTranslation('pl').subscribe(resolve));

    http.expectOne('./i18n/pl.json').flush({ 'Basic.save': 'Zapisz' });
    http
      .expectOne(`${environment.apiUrl}/translations/pl`)
      .error(new ProgressEvent('failed'), { status: 503, statusText: 'Service Unavailable' });

    expect(await merged).toEqual({ 'Basic.save': 'Zapisz' });
  });
});
