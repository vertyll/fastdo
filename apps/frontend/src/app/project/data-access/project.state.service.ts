import { Injectable, signal, computed } from '@angular/core';
import { Project } from '../model/Project';

@Injectable({ providedIn: 'root' })
export class ProjectsStateService {
  private projectsSignal = signal<Project[]>([]);

  projects = computed(() => this.projectsSignal());
  projectCount = computed(() => this.projectsSignal().length);

  setProjectList(projects: Project[]): void {
    this.projectsSignal.set(projects);
  }

  addProject(project: Project): void {
    this.projectsSignal.update((projects) => [...projects, project]);
  }

  updateProject(updatedProject: Project): void {
    this.projectsSignal.update((projects) =>
      projects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project,
      ),
    );
  }

  removeProject(projectId: Project['id']): void {
    this.projectsSignal.update((projects) =>
      projects.filter((project) => project.id !== projectId),
    );
  }
}
