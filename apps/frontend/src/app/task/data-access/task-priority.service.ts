import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TaskPriorityApiService } from './task-priority-api.service';
import { ApiResponse } from 'src/app/shared/defs/api-response.defs';
import { TaskPriority } from 'src/app/shared/defs/entities.defs';

@Injectable({
  providedIn: 'root',
})
export class TaskPriorityService {
  private readonly httpService = inject(TaskPriorityApiService);

  public getAll(): Observable<ApiResponse<TaskPriority[]>> {
    return this.httpService.getAll();
  }
}
