import { Component, OnInit } from '@angular/core';
import { getCookie, setCookie } from '../../utils/cookies';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../atoms/button.component';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [TranslateModule, ButtonComponent],
  template: `
    @if (showBanner) {
      <div class="fixed bottom-0 left-0 right-0 bg-black p-4 shadow-md z-50">
        <div
          class="container mx-auto flex flex-col sm:flex-row justify-between items-center"
        >
          <p class="text-sm text-gray-300 mb-2 sm:mb-0">
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
    const cookiesAccepted = getCookie('cookies_accepted');
    if (!cookiesAccepted) {
      this.showBanner = true;
    }
  }

  protected acceptCookies(): void {
    setCookie('cookies_accepted', 'true', 365);
    this.showBanner = false;
  }
}
