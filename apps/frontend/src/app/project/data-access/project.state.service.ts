import { Injectable, computed, inject, signal } from '@angular/core';
import { LOADING_STATE_VALUE } from 'src/app/shared/types/list-state.type';
import { PaginationMeta } from '../../shared/types/api-response.type';
import { Project } from '../models/Project';
import { ProjectsApiService } from './project.api.service';

@Injectable({ providedIn: 'root' })
export class ProjectsStateService {
  private readonly apiService = inject(ProjectsApiService);

  private readonly projectsSignal = signal<Project[]>([]);
  private readonly paginationSignal = signal<PaginationMeta>({
    total: 0,
    page: 0,
    pageSize: 10,
    totalPages: 0,
  });

  public projects = computed(() => this.projectsSignal());
  public state = computed(() =>
    this.apiService.$idle()
      ? LOADING_STATE_VALUE.IDLE
      : this.apiService.$loading()
        ? LOADING_STATE_VALUE.LOADING
        : this.apiService.$error()
          ? LOADING_STATE_VALUE.ERROR
          : LOADING_STATE_VALUE.SUCCESS,
  );
  public error = computed(() => this.apiService.$error());
  public readonly pagination = this.paginationSignal.asReadonly();

  public setProjectList(projects: Project[]): void {
    this.projectsSignal.set(projects);
  }

  public addProject(project: Project): void {
    this.projectsSignal.update(projects => [...projects, project]);
  }

  public updateProject(updatedProject: Project): void {
    this.projectsSignal.update(projects =>
      projects.map(project => (project.id === updatedProject.id ? updatedProject : project)),
    );
  }

  public removeProject(projectId: Project['id']): void {
    this.projectsSignal.update(projects => projects.filter(project => project.id !== projectId));
  }

  public setPagination(pagination: PaginationMeta): void {
    this.paginationSignal.set(pagination);
  }
}
