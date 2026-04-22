import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import { ProjectStatus } from '../../shared/defs/entities.defs';
import { HttpApiService } from '../../shared/services/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectStatusApiService extends HttpApiService {
  public getByProjectId(projectId: number): Observable<ApiResponse<ProjectStatus[]>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<ProjectStatus[]>>(`${this.baseUrl}/projects/${projectId}/statuses`),
    );
  }
}
