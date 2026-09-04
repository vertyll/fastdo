import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectStatusApiService } from './project-status.api.service';
import { ProjectStatus } from '../defs/project.defs';

@Injectable({
  providedIn: 'root',
})
export class ProjectStatusService {
  private readonly httpService = inject(ProjectStatusApiService);

  public getByProjectId(projectId: string): Observable<ProjectStatus[]> {
    return this.httpService.getByProjectId(projectId);
  }
}
