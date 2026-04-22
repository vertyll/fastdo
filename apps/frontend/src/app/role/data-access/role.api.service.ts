import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/types/api-response.type';
import { Role } from '../../shared/types/entities.type';
import { HttpApiService } from '../../shared/services/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class RoleApiService extends HttpApiService {
  public getAllRoles(lang?: string): Observable<ApiResponse<Role[]>> {
    const options: { headers?: Record<string, string> } = {};
    if (lang) {
      options.headers = { 'x-lang': lang };
    }

    return this.withLoadingState(this.http.get<ApiResponse<Role[]>>(`${this.baseUrl}/roles`, options));
  }
}
