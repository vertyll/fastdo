import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import { HttpApiService } from '../../shared/services/http-api.service';
import { ProjectType } from '../defs/project.defs';

@Injectable({
  providedIn: 'root',
})
export class ProjectTypeApiService extends HttpApiService {
  public getAll(): Observable<ApiResponse<ProjectType[]>> {
    return this.http.get<ApiResponse<ProjectType[]>>(`${this.baseUrl}/project-types`);
  }

  public getById(id: string): Observable<ApiResponse<ProjectType>> {
    return this.http.get<ApiResponse<ProjectType>>(`${this.baseUrl}/project-types/${id}`);
  }
}
