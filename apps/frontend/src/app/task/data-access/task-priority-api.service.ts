import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/types/api-response.type';
import { TaskPriority } from '../../shared/types/entities.type';
import { HttpApiService } from '../../shared/services/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class TaskPriorityApiService extends HttpApiService {
  public getAll(): Observable<ApiResponse<TaskPriority[]>> {
    return this.withLoadingState(this.http.get<ApiResponse<TaskPriority[]>>(`${this.baseUrl}/task-priorities`));
  }
}
