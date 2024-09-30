import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  template: `
    @if (showBanner) {
      <div class="fixed bottom-0 left-0 right-0 bg-black p-4 shadow-md z-50">
        <div
          class="container mx-auto flex flex-col sm:flex-row justify-between items-center"
        >
          <p class="text-sm text-gray-300 mb-2 sm:mb-0">
            Ta strona używa plików cookie, aby poprawić Twoje doświadczenie.
            Korzystając z naszej strony, zgadzasz się na wykorzystanie plików
            cookie.
          </p>
          <div class="flex items-center">
            <button
              (click)="acceptCookies()"
              class="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
            >
              Akceptuję
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CookieBannerComponent implements OnInit {
  showBanner: boolean = false;

  ngOnInit(): void {
    const cookiesAccepted = this.getCookie('cookies_accepted');
    if (!cookiesAccepted) {
      this.showBanner = true;
    }
  }

  acceptCookies(): void {
    this.setCookie('cookies_accepted', 'true', 365);
    this.showBanner = false;
  }

  private setCookie(name: string, value: string, days: number): void {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + date.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/`;
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
}
