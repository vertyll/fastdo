import { Injectable, computed, inject, signal } from '@angular/core';
import { LIST_STATE_VALUE } from 'src/app/shared/types/list-state.type';
import { Project } from '../models/Project';
import { ProjectsApiService } from './project.api.service';

@Injectable({ providedIn: 'root' })
export class ProjectsStateService {
  private readonly projectsSignal = signal<Project[]>([]);
  private readonly apiService = inject(ProjectsApiService);

  public projects = computed(() => this.projectsSignal());
  public projectCount = computed(() => this.projectsSignal().length);
  public state = computed(() =>
    this.apiService.$idle()
      ? LIST_STATE_VALUE.IDLE
      : this.apiService.$loading()
      ? LIST_STATE_VALUE.LOADING
      : this.apiService.$error()
      ? LIST_STATE_VALUE.ERROR
      : LIST_STATE_VALUE.SUCCESS
  );
  public error = computed(() => this.apiService.$error());

  public setProjectList(projects: Project[]): void {
    this.projectsSignal.set(projects);
  }

  public addProject(project: Project): void {
    this.projectsSignal.update(projects => [...projects, project]);
  }

  public updateProject(updatedProject: Project): void {
    this.projectsSignal.update(projects =>
      projects.map(project => project.id === updatedProject.id ? updatedProject : project)
    );
  }

  public removeProject(projectId: Project['id']): void {
    this.projectsSignal.update(projects => projects.filter(project => project.id !== projectId));
  }
}
