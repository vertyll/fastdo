import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectCategoryApiService } from './project-category.api.service';
import { ApiResponse } from 'src/app/shared/types/api-response.type';
import { ProjectCategory } from 'src/app/shared/types/entities.type';

@Injectable({
  providedIn: 'root',
})
export class ProjectCategoryService {
  private readonly httpService = inject(ProjectCategoryApiService);

  public getByProjectId(projectId: number): Observable<ApiResponse<ProjectCategory[]>> {
    return this.httpService.getByProjectId(projectId);
  }
}
