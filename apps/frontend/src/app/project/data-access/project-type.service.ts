import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../shared/types/api-response.type';
import { ProjectType } from '../models/Project';

@Injectable({
  providedIn: 'root',
})
export class ProjectTypeService {
  private readonly URL = environment.backendUrl + '/api';
  private readonly http = inject(HttpClient);

  public getAll(): Observable<ApiResponse<ProjectType[]>> {
    return this.http.get<ApiResponse<ProjectType[]>>(`${this.URL}/project-types`);
  }
}
