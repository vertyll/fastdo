import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/types/api-response.type';
import { ProjectStatus } from '../../shared/types/entities.type';
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
