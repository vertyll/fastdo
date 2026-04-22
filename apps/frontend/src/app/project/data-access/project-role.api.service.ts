import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import { ProjectRole } from '../../shared/defs/entities.defs';
import { HttpApiService } from '../../shared/services/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectRoleApiService extends HttpApiService {
  public getAll(): Observable<ApiResponse<ProjectRole[]>> {
    return this.withLoadingState(this.http.get<ApiResponse<ProjectRole[]>>(`${this.baseUrl}/project-roles`));
  }
}
