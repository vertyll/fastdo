import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/data-access/auth.service';
import { RoleService } from 'src/app/role/data-access/role.service';
import { CookieBannerComponent } from '../molecules/cookie-banner.component';
import { ScrollToTopComponent } from '../molecules/scroll-to-top.component';
import { FooterComponent } from '../organisms/footer.component';
import { InfoPanelComponent } from '../organisms/info-panel.component';
import { NavbarComponent } from '../organisms/navbar.component';

@Component({
  selector: 'app-layout',
  imports: [NavbarComponent, CookieBannerComponent, FooterComponent, InfoPanelComponent, ScrollToTopComponent],
  template: `
    <div class="flex flex-col min-h-screen">
      <app-navbar />
      <main class="grow">
        <div class="grid px-6">
          <ng-content></ng-content>
        </div>
      </main>
      <app-info-panel
        [panelOpen]="panelOpen"
        [togglePanel]="togglePanel.bind(this)"
        [userRolesString]="userRolesString()"
        [currentTime]="currentTime()"
        [browserInfo]="browserInfo"
        [isLoggedIn]="isLoggedIn.bind(this)"
      />
      <app-cookie-banner />
      <app-scroll-to-top />
      <app-footer />
    </div>
  `,
})
export class LayoutComponent implements OnInit, OnDestroy {
  protected readonly authService = inject(AuthService);
  protected readonly translateService = inject(TranslateService);
  protected readonly roleService = inject(RoleService);
  protected readonly router = inject(Router);

  private rolesSubscription: Subscription | undefined;
  private timeIntervalId: number | undefined;

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
  protected currentTime = signal<string>('');
  protected browserInfo: string = '';

  ngOnInit(): void {
    this.authService.initializeAuth();

    if (this.isLoggedIn()) {
      this.loadRoles();
    }

    this.updateTime();
    this.browserInfo = this.getBrowserInfo();

    this.timeIntervalId = globalThis.setInterval(() => this.updateTime(), 1000);
  }

  ngOnDestroy(): void {
    this.rolesSubscription?.unsubscribe();

    if (this.timeIntervalId) {
      clearInterval(this.timeIntervalId);
    }
  }

  private loadRoles(): void {
    const currentLang = this.translateService.getCurrentLang() || 'en';
    this.rolesSubscription = this.roleService.getAllRoles(currentLang).subscribe({
      error: error => {
        console.warn('Failed to load roles:', error);
      },
    });
  }

  protected togglePanel(): void {
    this.panelOpen = !this.panelOpen;
  }

  private updateTime(): void {
    this.currentTime.set(new Date().toLocaleTimeString());
  }

  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const translatedUserAgent = this.translateService.instant('BrowserInfo.userAgent');
    const translatedLanguage = this.translateService.instant('BrowserInfo.language');
    return `${translatedUserAgent}: ${userAgent}, ${translatedLanguage}: ${language}`;
  }
}
