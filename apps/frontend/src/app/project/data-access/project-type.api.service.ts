import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpApiService } from '../../shared/services/http-api.service';
import { ProjectType } from '../defs/project.defs';

@Injectable({
  providedIn: 'root',
})
export class ProjectTypeApiService extends HttpApiService {
  public getAll(): Observable<ProjectType[]> {
    return this.http.get<ProjectType[]>(`${this.baseUrl}/project-types`);
  }

  public getById(id: string): Observable<ProjectType> {
    return this.http.get<ProjectType>(`${this.baseUrl}/project-types/${id}`);
  }
}
