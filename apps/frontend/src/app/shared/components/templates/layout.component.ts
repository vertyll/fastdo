import { Component, OnInit, computed, inject, signal, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/auth/data-access/auth.service';
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
        [togglePanel]="togglePanel"
        [userRolesString]="userRolesString()"
        [currentTime]="currentTime()"
        [browserInfo]="browserInfo"
        [isLoggedIn]="isLoggedIn"
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
  protected readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected isLoggedIn = this.authService.isLoggedIn;
  protected userRoles = this.authService.userRoles;
  protected userRolesString = computed(() => this.userRoles().join(', '));
  protected panelOpen: boolean = false;
  protected currentTime = signal<string>('');
  protected browserInfo: string = '';

  ngOnInit(): void {
    this.updateTime();
    this.browserInfo = this.getBrowserInfo();

    const timeIntervalId = globalThis.setInterval(() => this.updateTime(), 1000);
    this.destroyRef.onDestroy(() => clearInterval(timeIntervalId));
  }

  protected togglePanel = (): void => {
    this.panelOpen = !this.panelOpen;
  };

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
