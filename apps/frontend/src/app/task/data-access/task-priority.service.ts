import { Injectable, inject } from '@angular/core';
import { TaskPriorityApiService } from './task-priority-api.service';

@Injectable({
  providedIn: 'root',
})
export class TaskPriorityService {
  private readonly httpService = inject(TaskPriorityApiService);

  public getAll() {
    return this.httpService.getAll();
  }
}
