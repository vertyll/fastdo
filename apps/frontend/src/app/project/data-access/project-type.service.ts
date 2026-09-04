import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectTypeApiService } from './project-type.api.service';
import { ProjectType } from '../defs/project.defs';

@Injectable({
  providedIn: 'root',
})
export class ProjectTypeService {
  private readonly httpService = inject(ProjectTypeApiService);

  public getAll(): Observable<ProjectType[]> {
    return this.httpService.getAll();
  }
}
