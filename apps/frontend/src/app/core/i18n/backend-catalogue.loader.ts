import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/defs/api-response.defs';

type Catalogue = Record<string, string>;

interface BackendCatalogue {
  language: string;
  version: string;
  entries: Catalogue;
}

@Injectable()
export class BackendCatalogueLoader implements TranslateLoader {
  private readonly http = new HttpClient(inject(HttpBackend));

  public getTranslation(language: string): Observable<Catalogue> {
    return forkJoin({
      ui: this.http.get<Catalogue>(`./i18n/${language}.json`),
      backend: this.http.get<ApiResponse<BackendCatalogue>>(`${environment.apiUrl}/translations/${language}`).pipe(
        map(response => response.data.entries),
        catchError(() => of({} as Catalogue)),
      ),
    }).pipe(map(({ ui, backend }) => ({ ...ui, ...backend })));
  }
}
