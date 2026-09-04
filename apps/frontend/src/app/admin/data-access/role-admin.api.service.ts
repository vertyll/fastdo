import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
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
    return this.http.get<Role[]>(`${this.baseUrl}/roles`, { params });
  }

  public getPermissionModules(): Observable<PermissionModule[]> {
    return this.http.get<PermissionModule[]>(`${this.baseUrl}/permissions/modules`);
  }

  public createRole(payload: CreateRolePayload): Observable<Role> {
    return this.http.post<Role>(`${this.baseUrl}/roles`, payload);
  }

  public updateRole(name: string, payload: UpdateRolePayload, version: number | null): Observable<Role> {
    const headers = version === null ? undefined : new HttpHeaders({ 'If-Match': `W/"${version}"` });
    return this.http.put<Role>(`${this.baseUrl}/roles/name/${encodeURIComponent(name)}`, payload, { headers });
  }

  public deleteRole(name: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/roles/name/${encodeURIComponent(name)}`).pipe(map(() => undefined));
  }

  public getUsers(page: number, size: number, searchTerm?: string): Observable<PagedUsers> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    return this.http.get<PagedUsers>(`${this.baseUrl}/users`, { params });
  }

  public assignRole(userId: number, roleName: string, version: number | null): Observable<void> {
    const headers = version === null ? undefined : new HttpHeaders({ 'If-Match': `W/"${version}"` });
    return this.http
      .post<void>(`${this.baseUrl}/roles/user/${userId}/role/${encodeURIComponent(roleName)}`, {}, { headers })
      .pipe(map(() => undefined));
  }

  public removeRole(userId: number, roleName: string, version: number | null): Observable<void> {
    const headers = version === null ? undefined : new HttpHeaders({ 'If-Match': `W/"${version}"` });
    return this.http
      .delete<void>(`${this.baseUrl}/roles/user/${userId}/role/${encodeURIComponent(roleName)}`, {
        headers,
      })
      .pipe(map(() => undefined));
  }
}
