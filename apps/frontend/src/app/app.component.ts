import { Component, inject } from '@angular/core';
import { TaskListPageComponent } from './task/task-list.page.component';
import { ProjectListPageComponent } from './project/project-list.page.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TasksStateService } from './task/data-access/tasks.state.service';
import { ProjectsStateService } from './project/data-access/projects.state.service';
import { ProjectsService } from './project/data-access/project.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TaskListPageComponent,
    ProjectListPageComponent,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  styles: [
    `
      main,
      nav {
        @apply px-12;
      }
    `,
  ],
  template: `
    <h1 class="text-orange-500 uppercase py-4 text-2xl text-center bg-black">
      todolist
    </h1>
    <nav class="bg-orange-300 py-4">
      <ul class="flex gap-6">
        <li>
          <a
            routerLink="/tasks"
            routerLinkActive="font-bold"
            [routerLinkActiveOptions]="{ exact: true }"
            >Tasks</a
          >
        </li>
        <li>
          <a routerLink="/projects" routerLinkActive="font-bold"
            >Projects ({{ projectCount }})</a
          >
        </li>
        <li class="ml-auto">
          <a routerLink="/tasks/urgent" routerLinkActive="font-bold"
            >Urgent ({{ urgentCount }})</a
          >
        </li>
      </ul>
    </nav>
    <main class="grid pt-4">
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
  tasksStateService = inject(TasksStateService);
  projectsStateService = inject(ProjectsStateService);
  projectsService = inject(ProjectsService);

  urgentCount = 0;
  projectCount = 0;

  ngOnInit() {
    this.tasksStateService.value$.subscribe((state) => {
      this.urgentCount = state.urgentCount;
    });

    this.projectsStateService.value$.subscribe((state) => {
      this.projectCount = state.projects.length;
    });

    this.projectsService.getAll().subscribe();
  }
}
