import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectTypeApiService } from './project-type.api.service';
import { ApiResponse } from 'src/app/shared/defs/api-response.defs';
import { ProjectType } from '../defs/project.defs';

@Injectable({
  providedIn: 'root',
})
export class ProjectTypeService {
  private readonly httpService = inject(ProjectTypeApiService);

  public getAll(): Observable<ApiResponse<ProjectType[]>> {
    return this.httpService.getAll();
  }
}
