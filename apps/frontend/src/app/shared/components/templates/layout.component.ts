import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/data-access/auth.service';
import { ProjectsService } from 'src/app/project/data-access/project.service';
import { ProjectsStateService } from 'src/app/project/data-access/project.state.service';
import { TasksService } from 'src/app/task/data-access/task.service';
import { TasksStateService } from 'src/app/task/data-access/task.state.service';
import { CookieBannerComponent } from '../molecules/cookie-banner.component';
import { NavbarComponent } from '../organisms/navbar.component';
import { FooterComponent } from '../organisms/footer.component';
import { InfoPanelComponent } from '../organisms/info-panel.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
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
  protected readonly authService = inject(AuthService);
  protected readonly translateService = inject(TranslateService);
  protected readonly router = inject(Router);

  private readonly tasksStateService = inject(TasksStateService);
  private readonly projectsStateService = inject(ProjectsStateService);
  private readonly projectsService = inject(ProjectsService);
  private readonly tasksService = inject(TasksService);

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
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const translatedUserAgent = this.translateService.instant(
      'BrowserInfo.userAgent',
    );
    const translatedLanguage = this.translateService.instant(
      'BrowserInfo.language',
    );
    return `${translatedUserAgent}: ${userAgent}, ${translatedLanguage}: ${language}`;
  }
}