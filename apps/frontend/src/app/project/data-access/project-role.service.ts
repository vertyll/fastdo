import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRoleApiService } from './project-role.api.service';
import { ProjectRole } from 'src/app/shared/types/entities.type';
import { ApiResponse } from 'src/app/shared/types/api-response.type';

@Injectable({
  providedIn: 'root',
})
export class ProjectRoleService {
  private readonly httpService = inject(ProjectRoleApiService);

  public getAll(): Observable<ApiResponse<ProjectRole[]>> {
    return this.httpService.getAll();
  }
}
