import { Injectable, Signal, signal } from '@angular/core';

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

  public getWindowWidth(): Signal<number> {
    return this.windowWidth.asReadonly();
  }
}
