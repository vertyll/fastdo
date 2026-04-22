import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/types/api-response.type';
import { ProjectCategory } from '../../shared/types/entities.type';
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
