import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SpinnerSize } from '../../types/components.type';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-spinner',
  template: `
    <div
      class="spinner border-4 border-t-4 border-gray-200 rounded-full animate-spin"
      [ngClass]="{
        'w-8 h-8 border-t-blue-500': size === 'small',
        'w-12 h-12 border-t-blue-500': size === 'medium',
        'w-16 h-16 border-t-blue-500': size === 'large',
      }"
    ></div>
  `,
})
export class SpinnerComponent {
  @Input() size: SpinnerSize = 'medium';
}
