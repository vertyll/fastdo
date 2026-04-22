import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectCategoryApiService } from './project-category.api.service';
import { ApiResponse } from 'src/app/shared/defs/api-response.defs';
import { ProjectCategory } from 'src/app/shared/defs/entities.defs';

@Injectable({
  providedIn: 'root',
})
export class ProjectCategoryService {
  private readonly httpService = inject(ProjectCategoryApiService);

  public getByProjectId(projectId: number): Observable<ApiResponse<ProjectCategory[]>> {
    return this.httpService.getByProjectId(projectId);
  }
}
