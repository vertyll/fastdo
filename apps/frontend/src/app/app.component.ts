import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TasksStateService } from './task/data-access/task.state.service';
import { ProjectsStateService } from './project/data-access/project.state.service';
import { ProjectsService } from './project/data-access/project.service';
import { AuthService } from './auth/data-access/auth.service';
import { TasksService } from './task/data-access/task.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { CookieBannerComponent } from './shared/components/cookie-banner/cookie-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CookieBannerComponent],
  styles: [
    `
      main {
        @apply px-12;
      }
      .info-panel {
        @apply fixed bottom-0 right-0 bg-gray-800 text-white p-4 transition-transform transform translate-x-full;
        width: calc(100% - 40px);
      }
      .info-panel.open {
        @apply translate-x-0;
      }
      .toggle-button {
        @apply fixed bottom-0 right-0 bg-orange-500 text-white p-4 cursor-pointer flex items-center justify-center;
        z-index: 10;
        width: 40px;
        height: 40px;
        user-select: none;
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
      [urgentCount]="urgentCount()"
      [projectCount]="projectCount()"
    ></app-navbar>
    <main class="grid pt-4">
      <router-outlet />
    </main>
    @if (isLoggedIn()) {
      <div class="toggle-button" (click)="togglePanel()">
        @if (!panelOpen) {
          <span>&#8592;</span>
        } @else {
          <span>&#8594;</span>
        }
      </div>
    }
    <div class="info-panel" [class.open]="panelOpen">
      <div>Your roles: {{ userRolesString() }}</div>
      <div>Current time: {{ currentTime }}</div>
      <div>Browser info: {{ browserInfo }}</div>
    </div>
    <app-cookie-banner></app-cookie-banner>
  `,
})
export class AppComponent implements OnInit {
  private readonly tasksStateService = inject(TasksStateService);
  private readonly projectsStateService = inject(ProjectsStateService);
  private readonly projectsService = inject(ProjectsService);
  private readonly tasksService = inject(TasksService);
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);
  protected urgentCount = this.tasksStateService.urgentCount;
  protected projectCount = this.projectsStateService.projectCount;
  protected isLoggedIn = this.authService.isLoggedIn;
  protected userRoles = this.authService.userRoles;
  protected userRolesString = computed(
    () => this.userRoles()?.join(', ') || '',
  );
  protected panelOpen: boolean = false;
  protected currentTime: string = '';
  protected browserInfo: string = '';

  constructor() {
    effect(
      () => {
        if (this.isLoggedIn()) {
          this.projectsService.getAll().subscribe();
          this.tasksService.getAll().subscribe();
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit(): void {
    this.authService.initializeAuth();
    this.updateTime();
    this.browserInfo = this.getBrowserInfo();
    setInterval(() => this.updateTime(), 1000);
  }

  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
  }

  updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
  }

  getBrowserInfo(): string {
    return `User Agent: ${navigator.userAgent}, Language: ${navigator.language}`;
  }
}
