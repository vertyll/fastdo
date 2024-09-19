import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TasksStateService } from './task/data-access/tasks.state.service';
import { ProjectsStateService } from './project/data-access/projects.state.service';
import { ProjectsService } from './project/data-access/projects.service';
import { AuthService } from './auth/data-access/auth.service';
import { TasksService } from './task/data-access/tasks.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  styles: [
    `
      main {
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
    <app-navbar
      [urgentCount]="urgentCount"
      [projectCount]="projectCount"
    ></app-navbar>
    <main class="grid pt-4">
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
  private readonly tasksStateService = inject(TasksStateService);
  private readonly projectsStateService = inject(ProjectsStateService);
  private readonly projectsService = inject(ProjectsService);
  private readonly tasksService = inject(TasksService);
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  protected urgentCount = 0;
  protected projectCount = 0;

  ngOnInit(): void {
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
}
