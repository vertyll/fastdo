import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import { HttpApiService } from '../../shared/services/http-api.service';
import { AdminUser, CreateRolePayload, PermissionModule, Role, RoleScope, UpdateRolePayload } from '../defs/role.defs';

interface PagedUsers {
  content: AdminUser[];
  totalElements: number;
}

@Injectable({
  providedIn: 'root',
})
export class RoleAdminApiService extends HttpApiService {
  public getRoles(scope?: RoleScope): Observable<Role[]> {
    const params = scope ? new HttpParams().set('scope', scope) : undefined;
    return this.http.get<ApiResponse<Role[]>>(`${this.baseUrl}/roles`, { params }).pipe(map(response => response.data));
  }

  public getPermissionModules(): Observable<PermissionModule[]> {
    return this.http
      .get<ApiResponse<PermissionModule[]>>(`${this.baseUrl}/permissions/modules`)
      .pipe(map(response => response.data));
  }

  public createRole(payload: CreateRolePayload): Observable<Role> {
    return this.http.post<ApiResponse<Role>>(`${this.baseUrl}/roles`, payload).pipe(map(response => response.data));
  }

  public updateRole(name: string, payload: UpdateRolePayload, version: number | null): Observable<Role> {
    const headers = version === null ? undefined : new HttpHeaders({ 'If-Match': `W/"${version}"` });
    return this.http
      .put<ApiResponse<Role>>(`${this.baseUrl}/roles/name/${encodeURIComponent(name)}`, payload, { headers })
      .pipe(map(response => response.data));
  }

  public deleteRole(name: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}/roles/name/${encodeURIComponent(name)}`)
      .pipe(map(() => undefined));
  }

  public getUsers(page: number, size: number): Observable<PagedUsers> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<ApiResponse<PagedUsers>>(`${this.baseUrl}/users`, { params })
      .pipe(map(response => response.data));
  }

  public assignRole(userId: number, roleName: string, version: number | null): Observable<void> {
    const headers = version === null ? undefined : new HttpHeaders({ 'If-Match': `W/"${version}"` });
    return this.http
      .post<ApiResponse<void>>(
        `${this.baseUrl}/roles/user/${userId}/role/${encodeURIComponent(roleName)}`,
        {},
        { headers },
      )
      .pipe(map(() => undefined));
  }

  public removeRole(userId: number, roleName: string, version: number | null): Observable<void> {
    const headers = version === null ? undefined : new HttpHeaders({ 'If-Match': `W/"${version}"` });
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}/roles/user/${userId}/role/${encodeURIComponent(roleName)}`, {
        headers,
      })
      .pipe(map(() => undefined));
  }
}
