import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';

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
      backend: this.http.get<BackendCatalogue>(`${environment.apiUrl}/translations/${language}`).pipe(
        map(response => response.entries),
        catchError(() => of({} as Catalogue)),
      ),
    }).pipe(map(({ ui, backend }) => ({ ...ui, ...backend })));
  }
}
