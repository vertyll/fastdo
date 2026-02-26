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
        'transition-colors duration-200 dark:text-dark-text-primary absolute text-sm text-text-secondary transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white/10 dark:bg-neutral-800/10 backdrop-blur-sm px-2 peer-focus:px-2 peer-focus:text-primary-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-4':
          isField(),
        'text-sm text-text-secondary-light mr-1 dark:text-dark-text-primary transition-colors duration-200': !isField(),
      }"
    >
      <ng-content></ng-content>
      @if (required()) {
        <span class="text-danger-500 ml-1">*</span>
      }
    </label>
  `,
})
export class LabelComponent {
  readonly forId = input<string | null>();
  readonly isField = input<boolean>(false);
  readonly required = input<boolean>(false);
}
