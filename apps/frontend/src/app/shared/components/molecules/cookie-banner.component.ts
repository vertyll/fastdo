import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { getCookie, setCookie } from '../../utils/cookies';
import { ButtonComponent } from '../atoms/button.component';
import { COOKIE_ACCEPTED_VALUE, COOKIE_EXPIRATION_DAYS, COOKIE_NAME } from '../../../app.contansts';

@Component({
  selector: 'app-cookie-banner',
  imports: [TranslateModule, ButtonComponent],
  template: `
    @if (showBanner) {
      <div class="fixed bottom-0 left-0 right-0 bg-neutral-900 p-4 shadow-md z-50">
        <div class="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p class="text-sm text-neutral-300 mb-2 sm:mb-0">
            {{ 'CookiesBanner.text' | translate }}
          </p>
          <div class="flex items-center">
            <app-button (click)="acceptCookies()">
              {{ 'Basic.accept' | translate }}
            </app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CookieBannerComponent implements OnInit {
  protected showBanner: boolean = false;

  ngOnInit(): void {
    const cookiesAccepted = getCookie(COOKIE_NAME);
    if (!cookiesAccepted) {
      this.showBanner = true;
    }
  }

  protected acceptCookies(): void {
    setCookie(COOKIE_NAME, COOKIE_ACCEPTED_VALUE, COOKIE_EXPIRATION_DAYS);
    this.showBanner = false;
  }
}
