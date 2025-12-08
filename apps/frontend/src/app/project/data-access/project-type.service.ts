import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectTypeApiService } from './project-type.api.service';
import { ApiResponse } from 'src/app/shared/types/api-response.type';
import { ProjectType } from '../models/Project';

@Injectable({
  providedIn: 'root',
})
export class ProjectTypeService {
  private readonly httpService = inject(ProjectTypeApiService);

  public getAll(): Observable<ApiResponse<ProjectType[]>> {
    return this.httpService.getAll();
  }
}
