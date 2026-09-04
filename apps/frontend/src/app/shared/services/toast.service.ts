import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { ToastPositionEnum } from '../enums/toast-position.enum';
import { ToastObject } from '../defs/components.defs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly initialState: ToastObject = {
    message: '',
    visible: false,
    success: false,
    className: '',
    position: ToastPositionEnum.Fixed,
  };

  private static readonly ERROR_VISIBLE_MS = 8000;
  private static readonly GENERIC_ERROR_KEY = 'Errors.unexpected';

  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private dismissTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly toastSignal = signal<ToastObject>(this.initialState);
  public readonly toast = computed(() => this.toastSignal());

  constructor() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      if (this.toastSignal().position !== ToastPositionEnum.BottomRight) {
        this.hideToast();
      }
    });
  }

  public presentToast(
    message: string,
    success: boolean = false,
    position: ToastPositionEnum = ToastPositionEnum.Fixed,
  ): void {
    this.toastSignal.set({
      message,
      visible: true,
      success,
      className: '',
      position,
    });

    if (position === ToastPositionEnum.Fixed) {
      globalThis.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }
  }

  public presentError(messageKey: string, params: Record<string, unknown> = {}): void {
    clearTimeout(this.dismissTimer);
    this.messageFor(messageKey, params).subscribe(message => {
      this.presentToast(message, false, ToastPositionEnum.BottomRight);
      this.dismissTimer = setTimeout(() => this.hideToast(), ToastService.ERROR_VISIBLE_MS);
    });
  }

  private messageFor(messageKey: string, params: Record<string, unknown>): Observable<string> {
    return this.translate.get(messageKey, params).pipe(
      switchMap(translated => {
        if (translated !== messageKey) {
          return of(translated);
        }
        console.warn(`No translation for error key "${messageKey}"`);
        return this.translate.get(ToastService.GENERIC_ERROR_KEY);
      }),
    );
  }

  public hideToast(): void {
    this.toastSignal.set(this.initialState);
  }
}
