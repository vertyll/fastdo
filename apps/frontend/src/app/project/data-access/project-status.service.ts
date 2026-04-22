import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectStatusApiService } from './project-status.api.service';
import { ApiResponse } from 'src/app/shared/defs/api-response.defs';
import { ProjectStatus } from 'src/app/shared/defs/entities.defs';

@Injectable({
  providedIn: 'root',
})
export class ProjectStatusService {
  private readonly httpService = inject(ProjectStatusApiService);

  public getByProjectId(projectId: number): Observable<ApiResponse<ProjectStatus[]>> {
    return this.httpService.getByProjectId(projectId);
  }
}
