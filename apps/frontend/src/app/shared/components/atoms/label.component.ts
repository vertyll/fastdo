import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-label',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label
      [for]="forId()"
      [ngClass]="{
        'transition-colors duration-200 dark:bg-gray-700 dark:text-white absolute text-sm text-gray-700 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-orange-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-4':
          isField(),
        'text-sm text-gray-700 mr-1 dark:text-white transition-colors duration-200': !isField(),
      }"
    >
      <ng-content></ng-content>
      @if (required()) {
        <span class="text-red-500 ml-1">*</span>
      }
    </label>
  `,
})
export class LabelComponent {
  readonly forId = input<string | null>();
  readonly isField = input<boolean>(false);
  readonly required = input<boolean>(false);
}
