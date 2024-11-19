import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-label',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label
      [for]="forId"
      [ngClass]="{
        'absolute text-sm text-gray-700 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-orange-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-4':
          isField,
        'text-sm text-gray-700 mr-1': !isField,
      }"
    >
      <ng-content></ng-content>
    </label>
  `,
})
export class LabelComponent {
  @Input() forId!: string | null;
  @Input() isField: boolean = false;
}
