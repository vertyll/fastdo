import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  public getByProjectId(projectId: string): Observable<ProjectCategory[]> {
    return this.withLoadingState(this.http.get<ProjectCategory[]>(this.path(projectId)));
  }

  public create(projectId: string, payload: CategoryPayload): Observable<ProjectCategory> {
    return this.http.post<ProjectCategory>(this.path(projectId), payload);
  }

  public update(
    projectId: string,
    categoryId: string,
    payload: CategoryPayload,
    version: number | null,
  ): Observable<ProjectCategory> {
    return this.http.put<ProjectCategory>(`${this.path(projectId)}/${categoryId}`, payload, {
      headers: this.ifMatch(version),
    });
  }

  public delete(projectId: string, categoryId: string): Observable<void> {
    return this.http.delete<void>(`${this.path(projectId)}/${categoryId}`);
  }
}
