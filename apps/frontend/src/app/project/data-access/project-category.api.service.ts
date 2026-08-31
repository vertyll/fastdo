import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import { HttpApiService } from '../../shared/services/http-api.service';
import { ProjectCategory, Translation } from '../defs/project.defs';

export type CategoryPayload = {
  color: string;
  translations: Translation[];
  isActive?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class ProjectCategoryApiService extends HttpApiService {
  private path(projectId: string): string {
    return `${this.baseUrl}/projects/${projectId}/categories`;
  }

  public getByProjectId(projectId: string): Observable<ApiResponse<ProjectCategory[]>> {
    return this.withLoadingState(this.http.get<ApiResponse<ProjectCategory[]>>(this.path(projectId)));
  }

  public create(projectId: string, payload: CategoryPayload): Observable<ApiResponse<ProjectCategory>> {
    return this.http.post<ApiResponse<ProjectCategory>>(this.path(projectId), payload);
  }

  public update(
    projectId: string,
    categoryId: string,
    payload: CategoryPayload,
    version: number | null,
  ): Observable<ApiResponse<ProjectCategory>> {
    return this.http.put<ApiResponse<ProjectCategory>>(`${this.path(projectId)}/${categoryId}`, payload, {
      headers: this.ifMatch(version),
    });
  }

  public delete(projectId: string, categoryId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.path(projectId)}/${categoryId}`);
  }
}
