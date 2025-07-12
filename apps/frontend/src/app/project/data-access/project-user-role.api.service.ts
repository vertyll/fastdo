import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../shared/types/api-response.type';
import { ProjectUserRole } from '../models/Project';

@Injectable({
  providedIn: 'root',
})
export class ProjectUserRoleApiService {
  private readonly URL = environment.backendUrl + '/api';
  private readonly http = inject(HttpClient);

  public getUsersInProject(projectId: number): Observable<ApiResponse<ProjectUserRole[]>> {
    return this.http.get<ApiResponse<ProjectUserRole[]>>(`${this.URL}/project-user-roles/project/${projectId}`);
  }
}
