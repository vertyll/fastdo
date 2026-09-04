import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpApiService } from '../../shared/services/http-api.service';
import { ProjectRole } from '../defs/project.defs';

@Injectable({
  providedIn: 'root',
})
export class ProjectRoleApiService extends HttpApiService {
  public getAll(): Observable<ProjectRole[]> {
    return this.withLoadingState(this.http.get<ProjectRole[]>(`${this.baseUrl}/project-roles`));
  }

  public getById(id: string): Observable<ProjectRole> {
    return this.http.get<ProjectRole>(`${this.baseUrl}/project-roles/${id}`);
  }
}
