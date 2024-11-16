import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputType } from '../../types/components.type';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <input
      [type]="type"
      [formControl]="control"
      [id]="id"
      [placeholder]="placeholder"
      [ngClass]="{
        'pb-3 pt-3.5': type !== 'date',
        'pb-1.5 pt-3': type === 'date',
      }"
      class="block w-full px-1 text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
    />
  `,
})
export class InputComponent {
  @Input() control!: FormControl;
  @Input() id!: string;
  @Input() type: InputType = 'text';
  @Input() placeholder = '';
}
