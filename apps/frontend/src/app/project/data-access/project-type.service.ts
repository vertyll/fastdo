import { Injectable, inject } from '@angular/core';
import { ProjectTypeApiService } from './project-type.api.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectTypeService {
  private readonly httpService = inject(ProjectTypeApiService);

  public getAll() {
    return this.httpService.getAll();
  }
}
