import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  imports: [ReactiveFormsModule],
  template: `
    <textarea
      [id]="id()"
      [formControl]="control()"
      [placeholder]="placeholder()"
      [rows]="rows()"
      class="dark:bg-gray-700 dark:text-white transition-colors duration-200 block w-full p-2 text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-orange-600 peer"
    ></textarea>
  `,
})
export class TextareaComponent {
  readonly id = input.required<string>();
  readonly control = input.required<FormControl>();
  readonly placeholder = input<string>('');
  readonly rows = input<number>(3);
}
