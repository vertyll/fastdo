import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WindowService {
  private readonly windowWidth = signal(window.innerWidth);

  constructor() {
    window.addEventListener('resize', () => {
      this.windowWidth.set(window.innerWidth);
    });
  }

  getWindowWidth() {
    return this.windowWidth.asReadonly();
  }
}
