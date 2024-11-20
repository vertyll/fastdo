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
      class="block w-full p-1 text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-orange-600 peer"
    ></textarea>
  `
})
export class TextareaComponent {
  readonly id = input.required<string>();
  readonly control = input.required<FormControl>();
  readonly placeholder = input<string>('');
  readonly rows = input<number>(3);
}
