import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpApiService } from '../../shared/services/http-api.service';
import { ProjectMember } from '../defs/project.defs';

@Injectable({
  providedIn: 'root',
})
export class ProjectUserRoleApiService extends HttpApiService {
  public getUsersInProject(projectId: string): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(`${this.baseUrl}/project-user-roles/project/${projectId}`);
  }
}
