import { Component } from '@angular/core';

@Component({
  selector: 'app-title',
  template: `
    <h2 class="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
      <ng-content></ng-content>
    </h2>
  `,
})
export class TitleComponent {}
