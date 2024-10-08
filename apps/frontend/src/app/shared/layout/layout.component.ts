import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  Signal,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from 'src/app/auth/data-access/auth.service';
import { ProjectsService } from 'src/app/project/data-access/project.service';
import { ProjectsStateService } from 'src/app/project/data-access/project.state.service';
import { TasksService } from 'src/app/task/data-access/task.service';
import { TasksStateService } from 'src/app/task/data-access/task.state.service';
import { CookieBannerComponent } from '../components/cookie-banner.component';
import { NavbarComponent } from '../components/navbar.component';
import { FooterComponent } from '../components/footer.component';
import { InfoPanelComponent } from '../components/info-panel.component';
import { Role } from '../enums/role.enum';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    CookieBannerComponent,
    FooterComponent,
    InfoPanelComponent,
  ],
  styles: [
    `
      main {
        @apply px-12;
      }
    `,
  ],
  template: `
    <app-navbar
      [urgentCount]="urgentCount()"
      [projectCount]="projectCount()"
    ></app-navbar>
    <main class="grid pt-4">
      <ng-content></ng-content>
    </main>
    <app-info-panel
      [panelOpen]="panelOpen"
      [togglePanel]="togglePanel.bind(this)"
      [userRolesString]="userRolesString()"
      [currentTime]="currentTime"
      [browserInfo]="browserInfo"
      [isLoggedIn]="isLoggedIn.bind(this)"
    ></app-info-panel>
    <app-cookie-banner></app-cookie-banner>
    <app-footer></app-footer>
  `,
})
export class LayoutComponent implements OnInit {
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

  protected togglePanel(): void {
    this.panelOpen = !this.panelOpen;
  }

  private updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
  }

  private getBrowserInfo(): string {
    return `User Agent: ${navigator.userAgent}, Language: ${navigator.language}`;
  }
}
