import { Component } from '@angular/core';
import { LayoutComponent } from './shared/layout/layout.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent, RouterOutlet],
  template: `
    <app-layout>
      <router-outlet></router-outlet>
    </app-layout>
  `,
})
export class AppComponent {}
