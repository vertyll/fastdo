import { Injectable, inject } from '@angular/core';
import { ProjectRoleApiService } from './project-role.api.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectRoleService {
  private readonly httpService = inject(ProjectRoleApiService);

  public getAll() {
    return this.httpService.getAll();
  }
}
