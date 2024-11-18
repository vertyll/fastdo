import { Component } from '@angular/core';

@Component({
  selector: 'app-title',
  standalone: true,
  template: `
    <h2 class="text-2xl font-bold mb-4">
      <ng-content></ng-content>
    </h2>
  `,
})
export class TitleComponent {}
