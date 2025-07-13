import { Injectable, inject } from '@angular/core';
import { ProjectUserRoleApiService } from './project-user-role.api.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectUserRoleService {
  private readonly httpService = inject(ProjectUserRoleApiService);

  public getUsersInProject(projectId: number) {
    return this.httpService.getUsersInProject(projectId);
  }
}
