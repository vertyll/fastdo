import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ToastPositionEnum } from '../enums/toast-position.enum';
import { ToastObject } from '../types/components.type';

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

  private readonly router = inject(Router);
  private toastSignal = signal<ToastObject>(this.initialState);
  public toast = computed(() => this.toastSignal());

  constructor() {
    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        this.hideToast();
      }
    });
  }

  presentToast(message: string, success: boolean = false, position: ToastPositionEnum = ToastPositionEnum.Fixed): void {
    this.toastSignal.set({
      message,
      visible: true,
      success,
      className: '',
      position,
    });

    if (position === ToastPositionEnum.Fixed) {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }
  }

  hideToast(): void {
    this.toastSignal.set(this.initialState);
  }
}
