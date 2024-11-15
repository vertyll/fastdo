import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, fromEvent } from 'rxjs';

const mobileWindowMaxWidth = 992;

@Injectable({
  providedIn: 'root',
})
export class PlatformService implements OnDestroy {
  private _platform: string;
  private _isPlatformBrowser: boolean;
  private _isMobile: boolean;
  private resizeObservable$: Observable<Event> = new Observable();
  private resizeSubscription$: Subscription = new Subscription();

  public platform$ = new BehaviorSubject(this.platform);
  public isPlatformBrowser$ = new BehaviorSubject(this.isPlatformBrowser);
  public isMobile$ = new BehaviorSubject(this.isMobile);

  constructor(@Inject(PLATFORM_ID) private readonly platformId: string) {
    this._platform = this.platformId;
    this._isPlatformBrowser = isPlatformBrowser(this.platformId);
    this._isMobile = false;

    if (this.isPlatformBrowser) {
      this.updateIsMobile();
      this.resizeObservable$ = fromEvent(window, 'resize');
      this.resizeSubscription$ = this.resizeObservable$.subscribe((_) => {
        this.updateIsMobile();
      });
    }
  }

  ngOnDestroy() {
    this.resizeSubscription$.unsubscribe();
  }

  set platform(val) {
    this._platform = val;
    this.platform$.next(val);
  }

  get platform() {
    return this._platform;
  }

  set isPlatformBrowser(val) {
    this._isPlatformBrowser = val;
    this.isPlatformBrowser$.next(val);
  }

  get isPlatformBrowser() {
    return this._isPlatformBrowser;
  }

  set isMobile(val) {
    this._isMobile = val;
    this.isMobile$.next(val);
  }

  get isMobile() {
    return this._isMobile;
  }

  private updateIsMobile() {
    if (this.isPlatformBrowser) {
      this.isMobile = window.innerWidth < mobileWindowMaxWidth;
    }
  }
}
