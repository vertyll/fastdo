import { Injectable, inject } from '@angular/core';
import { ProjectCategoryApiService } from './project-category.api.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectCategoryService {
  private readonly httpService = inject(ProjectCategoryApiService);

  public getByProjectId(projectId: number) {
    return this.httpService.getByProjectId(projectId);
  }
}
