import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { SpinnerSize } from '../../types/components.type';

@Component({
  imports: [CommonModule],
  selector: 'app-spinner',
  template: `
    <div
      class="spinner border-4 border-t-4 border-border-primary dark:border-dark-border-primary rounded-full animate-spin"
      [ngClass]="{
        'w-8 h-8 border-t-primary-500': size() === 'small',
        'w-12 h-12 border-t-primary-500': size() === 'medium',
        'w-16 h-16 border-t-primary-500': size() === 'large',
      }"
    ></div>
  `,
})
export class SpinnerComponent {
  readonly size = input<SpinnerSize>('medium');
}
