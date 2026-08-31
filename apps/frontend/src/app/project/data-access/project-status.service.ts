import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectStatusApiService } from './project-status.api.service';
import { ApiResponse } from 'src/app/shared/defs/api-response.defs';
import { ProjectStatus } from '../defs/project.defs';

@Injectable({
  providedIn: 'root',
})
export class ProjectStatusService {
  private readonly httpService = inject(ProjectStatusApiService);

  public getByProjectId(projectId: string): Observable<ApiResponse<ProjectStatus[]>> {
    return this.httpService.getByProjectId(projectId);
  }
}
