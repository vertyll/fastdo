import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRoleApiService } from './project-role.api.service';
import { ProjectRole } from 'src/app/shared/defs/entities.defs';
import { ApiResponse } from 'src/app/shared/defs/api-response.defs';

@Injectable({
  providedIn: 'root',
})
export class ProjectRoleService {
  private readonly httpService = inject(ProjectRoleApiService);

  public getAll(): Observable<ApiResponse<ProjectRole[]>> {
    return this.httpService.getAll();
  }
}
