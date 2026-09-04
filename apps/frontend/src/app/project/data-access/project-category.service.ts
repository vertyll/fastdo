import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectCategoryApiService } from './project-category.api.service';
import { ProjectCategory } from '../defs/project.defs';

@Injectable({
  providedIn: 'root',
})
export class ProjectCategoryService {
  private readonly httpService = inject(ProjectCategoryApiService);

  public getByProjectId(projectId: string): Observable<ProjectCategory[]> {
    return this.httpService.getByProjectId(projectId);
  }
}
