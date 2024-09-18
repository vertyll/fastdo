import { Component, inject } from '@angular/core';
import { ProjectListPageComponent } from './project/project-list/project-list.page.component';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { TasksStateService } from './task/data-access/tasks.state.service';
import { ProjectsStateService } from './project/data-access/projects.state.service';
import { ProjectsService } from './project/data-access/projects.service';
import { AuthService } from './auth/data-access/auth.service';
import { TasksService } from './task/data-access/tasks.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
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
    <h1
      class="text-orange-500 uppercase py-4 text-2xl text-center bg-black cursor-pointer"
      (click)="
        authService.isLoggedIn()
          ? router.navigate(['/tasks'])
          : router.navigate(['/'])
      "
    >
      todolist
    </h1>
    <nav class="bg-orange-300 py-4">
      <ul class="flex gap-6">
        @if (!authService.isLoggedIn(); as loggedIn) {
          <div class="ml-auto flex gap-4">
            <li>
              <a routerLink="/login">Login</a>
            </li>
            <li>
              <a routerLink="/register">Register</a>
            </li>
          </div>
        } @else {
          <li>
            <a routerLink="/tasks" routerLinkActive="font-bold">Tasks</a>
          </li>
          <li>
            <a routerLink="/projects" routerLinkActive="font-bold">Projects ({{projectCount}})</a>
          </li>
          <li class="ml-auto">
            <a routerLink="/tasks/urgent" routerLinkActive="font-bold"
              >Urgent ({{ urgentCount }})</a
            >
          </li>
          <li>
            <button (click)="logout()" class="text-red-500">Logout</button>
          </li>
        }
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
  tasksService = inject(TasksService);
  authService = inject(AuthService);
  router = inject(Router);

  urgentCount = 0;
  projectCount = 0;

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.projectsService.getAll().subscribe();
      this.tasksService.getAll().subscribe();
      this.tasksStateService.value$.subscribe((state) => {
        this.urgentCount = state.urgentCount;
      });
      this.projectsStateService.value$.subscribe((state) => {
        this.projectCount = state.projects.length;
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
