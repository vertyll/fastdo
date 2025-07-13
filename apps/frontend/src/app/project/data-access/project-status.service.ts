import { Injectable, inject } from '@angular/core';
import { ProjectStatusApiService } from './project-status.api.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectStatusService {
  private readonly httpService = inject(ProjectStatusApiService);

  public getByProjectId(projectId: number) {
    return this.httpService.getByProjectId(projectId);
  }
}
