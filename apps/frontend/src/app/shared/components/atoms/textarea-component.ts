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
      class="dark:bg-dark-background-primary dark:text-dark-text-primary transition-colors duration-transitionDuration-200 block w-full p-spacing-2 text-sm text-text-primary bg-transparent rounded-borderRadius-lg border border-border-primary dark:border-dark-border-primary appearance-none focus:outline-none focus:ring-0 focus:border-primary-500 dark:focus:border-primary-400 peer"
    ></textarea>
  `,
})
export class TextareaComponent {
  readonly id = input.required<string>();
  readonly control = input.required<FormControl>();
  readonly placeholder = input<string>('');
  readonly rows = input<number>(3);
}
