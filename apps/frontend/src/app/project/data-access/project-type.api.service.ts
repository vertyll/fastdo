import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/types/api-response.type';
import { ProjectType } from '../defs/project.defs';
import { HttpApiService } from '../../shared/services/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectTypeApiService extends HttpApiService {
  public getAll(): Observable<ApiResponse<ProjectType[]>> {
    return this.http.get<ApiResponse<ProjectType[]>>(`${this.baseUrl}/project-types`);
  }
}
