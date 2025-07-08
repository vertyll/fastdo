import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../shared/types/api-response.type';
import { ProjectType, SimpleProjectType } from '../models/Project';

@Injectable({
  providedIn: 'root',
})
export class ProjectTypeService {
  private readonly URL = environment.backendUrl + '/api';
  private readonly http = inject(HttpClient);

  public getAll(): Observable<ApiResponse<ProjectType[]>> {
    return this.http.get<ApiResponse<ProjectType[]>>(`${this.URL}/project-types`);
  }

  public getById(id: number): Observable<ApiResponse<ProjectType>> {
    return this.http.get<ApiResponse<ProjectType>>(`${this.URL}/project-types/${id}`);
  }

  public create(data: { name: string; description?: string; }): Observable<ApiResponse<ProjectType>> {
    return this.http.post<ApiResponse<ProjectType>>(`${this.URL}/project-types`, data);
  }

  public update(
    id: number,
    data: { name?: string; description?: string; isActive?: boolean; },
  ): Observable<ApiResponse<ProjectType>> {
    return this.http.patch<ApiResponse<ProjectType>>(`${this.URL}/project-types/${id}`, data);
  }

  public delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.URL}/project-types/${id}`);
  }

  public getAllSimple(lang?: string): Observable<ApiResponse<SimpleProjectType[]>> {
    if (lang) {
      return this.http.get<ApiResponse<SimpleProjectType[]>>(`${this.URL}/project-types`, { params: { lang } });
    }
    return this.http.get<ApiResponse<SimpleProjectType[]>>(`${this.URL}/project-types`);
  }
}
