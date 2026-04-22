import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/types/api-response.type';
import { ProjectRole } from '../../shared/types/entities.type';
import { HttpApiService } from '../../shared/services/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectRoleApiService extends HttpApiService {
  public getAll(): Observable<ApiResponse<ProjectRole[]>> {
    return this.withLoadingState(this.http.get<ApiResponse<ProjectRole[]>>(`${this.baseUrl}/project-roles`));
  }
}
