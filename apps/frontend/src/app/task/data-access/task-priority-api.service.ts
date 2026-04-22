import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import { TaskPriority } from '../../shared/defs/entities.defs';
import { HttpApiService } from '../../shared/services/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class TaskPriorityApiService extends HttpApiService {
  public getAll(): Observable<ApiResponse<TaskPriority[]>> {
    return this.withLoadingState(this.http.get<ApiResponse<TaskPriority[]>>(`${this.baseUrl}/task-priorities`));
  }
}
