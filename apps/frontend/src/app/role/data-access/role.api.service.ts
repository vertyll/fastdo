import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import { Role } from '../../shared/defs/entities.defs';
import { HttpApiService } from '../../shared/services/http-api.service';
import { X_LANG_HEADER } from '../../app.contansts';

@Injectable({
  providedIn: 'root',
})
export class RoleApiService extends HttpApiService {
  public getAllRoles(lang?: string): Observable<ApiResponse<Role[]>> {
    const headers = lang ? new HttpHeaders({ [X_LANG_HEADER]: lang }) : undefined;
    return this.withLoadingState(this.http.get<ApiResponse<Role[]>>(`${this.baseUrl}/roles`, { headers }));
  }
}
