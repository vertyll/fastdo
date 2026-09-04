import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRoleApiService } from './project-role.api.service';
import { ProjectRole } from '../defs/project.defs';

@Injectable({
  providedIn: 'root',
})
export class ProjectRoleService {
  private readonly httpService = inject(ProjectRoleApiService);

  public getAll(): Observable<ProjectRole[]> {
    return this.httpService.getAll();
  }
}
