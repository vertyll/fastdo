import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import { HttpApiService } from '../../shared/services/http-api.service';
import { ProjectMember } from '../defs/project.defs';

@Injectable({
  providedIn: 'root',
})
export class ProjectUserRoleApiService extends HttpApiService {
  public getUsersInProject(projectId: string): Observable<ApiResponse<ProjectMember[]>> {
    return this.http.get<ApiResponse<ProjectMember[]>>(`${this.baseUrl}/project-user-roles/project/${projectId}`);
  }
}
