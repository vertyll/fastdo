import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiPaginatedResponse, ApiResponse } from '../../shared/defs/api-response.defs';
import { HttpApiService } from '../../shared/services/http-api.service';
import {
  ImportReport,
  TranslationKeyDetails,
  TranslationSearchParams,
  TranslationValue,
} from '../defs/translation.defs';

const ADMIN_TRANSLATIONS = '/admin/translations';

@Injectable({
  providedIn: 'root',
})
export class TranslationAdminApiService extends HttpApiService {
  public searchKeys(search: TranslationSearchParams): Observable<ApiPaginatedResponse<TranslationKeyDetails>> {
    let params = new HttpParams().set('page', search.page ?? 0).set('size', search.size ?? 50);
    if (search.searchTerm) {
      params = params.set('searchTerm', search.searchTerm);
    }
    if (search.sourceService) {
      params = params.set('sourceService', search.sourceService);
    }
    if (search.onlyMissing) {
      params = params.set('onlyMissing', true);
    }

    return this.http
      .get<ApiResponse<ApiPaginatedResponse<TranslationKeyDetails>>>(`${this.baseUrl}${ADMIN_TRANSLATIONS}/keys`, {
        params,
      })
      .pipe(map(response => response.data));
  }

  public override(key: string, language: string, value: string, version: number | null): Observable<TranslationValue> {
    const headers = version === null ? undefined : new HttpHeaders({ 'If-Match': `W/"${version}"` });
    return this.http
      .put<ApiResponse<TranslationValue>>(
        `${this.baseUrl}${ADMIN_TRANSLATIONS}/keys/${encodeURIComponent(key)}/languages/${language}`,
        { value },
        { headers },
      )
      .pipe(map(response => response.data));
  }

  public clearOverride(key: string, language: string): Observable<TranslationValue> {
    return this.http
      .delete<ApiResponse<TranslationValue>>(
        `${this.baseUrl}${ADMIN_TRANSLATIONS}/keys/${encodeURIComponent(key)}/languages/${language}`,
      )
      .pipe(map(response => response.data));
  }

  public exportSpreadsheet(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${ADMIN_TRANSLATIONS}/export`, { responseType: 'blob' });
  }

  public importSpreadsheet(file: File): Observable<ImportReport> {
    const body = new FormData();
    body.append('file', file);
    return this.http
      .post<ApiResponse<ImportReport>>(`${this.baseUrl}${ADMIN_TRANSLATIONS}/import`, body)
      .pipe(map(response => response.data));
  }
}
