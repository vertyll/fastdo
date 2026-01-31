import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { MOBILE_WINDOW_MAX_WIDTH_BREAKPOINT } from '../../app.contansts';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly destroyRef = inject(DestroyRef);

  private readonly platformSignal = signal<string>(this.platformId as string);
  private readonly isPlatformBrowserSignal = signal<boolean>(isPlatformBrowser(this.platformId));
  private readonly isMobileSignal = signal<boolean>(false);

  public readonly platform = this.platformSignal.asReadonly();
  public readonly isPlatformBrowser = this.isPlatformBrowserSignal.asReadonly();
  public readonly isMobile = this.isMobileSignal.asReadonly();

  constructor() {
    if (this.isPlatformBrowserSignal()) {
      this.updateIsMobile();

      fromEvent(globalThis, 'resize')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.updateIsMobile();
        });
    }

    effect(() => {
      const platform = this.platformSignal();
      const isBrowser = this.isPlatformBrowserSignal();
      const isMobile = this.isMobileSignal();
      console.debug('Platform state updated:', {
        platform,
        isBrowser,
        isMobile,
      });
    });
  }

  private updateIsMobile(): void {
    if (this.isPlatformBrowserSignal()) {
      this.isMobileSignal.set(globalThis.innerWidth < MOBILE_WINDOW_MAX_WIDTH_BREAKPOINT);
    }
  }

  public updatePlatform(platform: string): void {
    this.platformSignal.set(platform);
  }

  public updateIsPlatformBrowser(isBrowser: boolean): void {
    this.isPlatformBrowserSignal.set(isBrowser);
  }
}
