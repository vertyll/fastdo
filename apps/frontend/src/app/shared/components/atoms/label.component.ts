import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-label',
  standalone: true,
  template: `
    <label
      [for]="forId"
      class="absolute text-sm text-gray-500 dark:text-gray-200 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-orange-600 peer-focus:dark:text-orange-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-4"
    >
      <ng-content></ng-content>
    </label>
  `,
})
export class LabelComponent {
  @Input() forId!: string;
}
