import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectUserRoleApiService } from './project-user-role.api.service';
import { ProjectMember } from '../defs/project.defs';

@Injectable({
  providedIn: 'root',
})
export class ProjectUserRoleService {
  private readonly httpService = inject(ProjectUserRoleApiService);

  public getUsersInProject(projectId: string): Observable<ProjectMember[]> {
    return this.httpService.getUsersInProject(projectId);
  }
}
