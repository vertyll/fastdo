import { Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/auth/data-access/auth.service';
import { RoleService } from 'src/app/role/data-access/role.service';
import { CookieBannerComponent } from '../molecules/cookie-banner.component';
import { ScrollToTopComponent } from '../molecules/scroll-to-top.component';
import { FooterComponent } from '../organisms/footer.component';
import { InfoPanelComponent } from '../organisms/info-panel.component';
import { NavbarComponent } from '../organisms/navbar.component';

@Component({
  selector: 'app-layout',
  imports: [
    NavbarComponent,
    CookieBannerComponent,
    FooterComponent,
    InfoPanelComponent,
    ScrollToTopComponent,
  ],
  template: `
    <div class="flex flex-col min-h-screen">
      <app-navbar />
      <main class="flex-grow">
        <div class="grid px-4">
          <ng-content></ng-content>
        </div>
      </main>
      <app-info-panel
        [panelOpen]="panelOpen"
        [togglePanel]="togglePanel.bind(this)"
        [userRolesString]="userRolesString()"
        [currentTime]="currentTime"
        [browserInfo]="browserInfo"
        [isLoggedIn]="isLoggedIn.bind(this)"
      />
      <app-cookie-banner />
      <app-scroll-to-top />
      <app-footer />
    </div>
  `,
})
export class LayoutComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly translateService = inject(TranslateService);
  protected readonly roleService = inject(RoleService);
  protected readonly router = inject(Router);

  protected isLoggedIn = this.authService.isLoggedIn;
  protected userRoles = this.authService.userRoles;
  protected userRolesString = computed(() => {
    const userRoleCodes = this.userRoles();
    if (!userRoleCodes || userRoleCodes.length === 0) return '';

    const allRoles = this.roleService.getRoles();
    if (allRoles.length === 0) return userRoleCodes.join(', ');

    const translatedRoles = userRoleCodes.map(roleCode => {
      const role = allRoles.find(r => r.code === roleCode);
      return role?.name || roleCode;
    });

    return translatedRoles.join(', ');
  });
  protected panelOpen: boolean = false;
  protected currentTime: string = '';
  protected browserInfo: string = '';

  ngOnInit(): void {
    this.authService.initializeAuth();

    if (this.isLoggedIn()) {
      this.loadRoles();
    }

    this.updateTime();
    this.browserInfo = this.getBrowserInfo();
    setInterval(() => this.updateTime(), 1000);
  }

  private loadRoles(): void {
    const currentLang = this.translateService.currentLang || 'en';
    this.roleService.getAllRoles(currentLang).subscribe({
      error: error => {
        console.warn('Failed to load roles:', error);
      },
    });
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
