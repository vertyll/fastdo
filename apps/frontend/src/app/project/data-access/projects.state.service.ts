import { Injectable } from '@angular/core';
import { Project } from '../model/Project';
import { BehaviorSubject } from 'rxjs';

const initialState = {
  projects: [] as Project[],
};

type ProjectsStateValue = typeof initialState;

@Injectable({ providedIn: 'root' })
export class ProjectsStateService {
  private state$ = new BehaviorSubject(initialState);

  value$ = this.state$.asObservable();

  setProjectList(projects: Project[]) {
    this.state$.next({
      projects,
    });
  }

  addProject(project: Project) {
    const updatedProjects = [...this.state$.value.projects, project];

    this.state$.next({
      projects: updatedProjects,
    });
  }

  updateProject(updatedProject: Project) {
    const updatedProjects = this.state$.value.projects.map((project) =>
      project.id === updatedProject.id ? updatedProject : project,
    );

    this.state$.next({
      projects: updatedProjects,
    });
  }

  removeProject(projectId: Project['id']) {
    const updatedProjects = this.state$.value.projects.filter((project) => {
      return project.id !== projectId;
    });

    this.state$.next({
      projects: updatedProjects,
    });
  }
}
