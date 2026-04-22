import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import { ProjectUserRole } from '../defs/project.defs';
import { HttpApiService } from '../../shared/services/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectUserRoleApiService extends HttpApiService {
  public getUsersInProject(projectId: number): Observable<ApiResponse<ProjectUserRole[]>> {
    return this.http.get<ApiResponse<ProjectUserRole[]>>(`${this.baseUrl}/project-user-roles/project/${projectId}`);
  }
}
