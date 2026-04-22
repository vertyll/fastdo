import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import { ProjectCategory } from '../../shared/defs/entities.defs';
import { HttpApiService } from '../../shared/services/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectCategoryApiService extends HttpApiService {
  public getByProjectId(projectId: number): Observable<ApiResponse<ProjectCategory[]>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<ProjectCategory[]>>(`${this.baseUrl}/projects/${projectId}/categories`),
    );
  }
}
