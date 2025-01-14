import { Injectable, computed, signal } from '@angular/core';
import { Project } from '../models/Project';

@Injectable({ providedIn: 'root' })
export class ProjectsStateService {
  private projectsSignal = signal<Project[]>([]);

  public projects = computed(() => this.projectsSignal());
  public projectCount = computed(() => this.projectsSignal().length);

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
