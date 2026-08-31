import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import { HttpApiService } from '../../shared/services/http-api.service';
import { ProjectStatus, Translation } from '../defs/project.defs';

export type StatusPayload = {
  color: string;
  translations: Translation[];
  isActive?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class ProjectStatusApiService extends HttpApiService {
  private path(projectId: string): string {
    return `${this.baseUrl}/projects/${projectId}/statuses`;
  }

  public getByProjectId(projectId: string): Observable<ApiResponse<ProjectStatus[]>> {
    return this.withLoadingState(this.http.get<ApiResponse<ProjectStatus[]>>(this.path(projectId)));
  }

  public create(projectId: string, payload: StatusPayload): Observable<ApiResponse<ProjectStatus>> {
    return this.http.post<ApiResponse<ProjectStatus>>(this.path(projectId), payload);
  }

  public update(
    projectId: string,
    statusId: string,
    payload: StatusPayload,
    version: number | null,
  ): Observable<ApiResponse<ProjectStatus>> {
    return this.http.put<ApiResponse<ProjectStatus>>(`${this.path(projectId)}/${statusId}`, payload, {
      headers: this.ifMatch(version),
    });
  }

  public delete(projectId: string, statusId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.path(projectId)}/${statusId}`);
  }
}
