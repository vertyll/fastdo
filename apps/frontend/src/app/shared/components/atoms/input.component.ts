import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputType } from '../../types/components.type';

@Component({
  selector: 'app-input',
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <input
      [type]="type()"
      [formControl]="control()"
      [id]="id()"
      [placeholder]="placeholder()"
      class="dark:bg-neutral-700 dark:text-dark-text-primary block w-full px-2 py-3 text-sm transition-colors duration-200 text-text-primary bg-transparent rounded-lg border border-border-primary dark:border-dark-border-primary appearance-none focus:outline-none focus:ring-0 focus:border-primary-600 dark:focus:border-primary-500 peer"
    />
  `,
})
export class InputComponent {
  readonly control = input.required<FormControl>();
  readonly id = input.required<string>();
  readonly type = input<InputType>('text');
  readonly placeholder = input('');
}
