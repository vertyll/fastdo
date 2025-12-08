import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectUserRoleApiService } from './project-user-role.api.service';
import { ApiResponse } from 'src/app/shared/types/api-response.type';
import { ProjectUserRole } from '../models/Project';

@Injectable({
  providedIn: 'root',
})
export class ProjectUserRoleService {
  private readonly httpService = inject(ProjectUserRoleApiService);

  public getUsersInProject(projectId: number): Observable<ApiResponse<ProjectUserRole[]>> {
    return this.httpService.getUsersInProject(projectId);
  }
}
