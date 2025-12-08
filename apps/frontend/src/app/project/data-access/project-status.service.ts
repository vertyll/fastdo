import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectStatusApiService } from './project-status.api.service';
import { ApiResponse } from 'src/app/shared/types/api-response.type';
import { ProjectStatus } from 'src/app/shared/types/entities.type';

@Injectable({
  providedIn: 'root',
})
export class ProjectStatusService {
  private readonly httpService = inject(ProjectStatusApiService);

  public getByProjectId(projectId: number): Observable<ApiResponse<ProjectStatus[]>> {
    return this.httpService.getByProjectId(projectId);
  }
}
