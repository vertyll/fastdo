import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputType } from '../../defs/components.defs';

@Component({
  selector: 'app-input',
  imports: [ReactiveFormsModule],
  template: `
    <input
      [type]="type()"
      [formControl]="control()"
      [id]="id()"
      [placeholder]="placeholder()"
      class="bg-background-secondary dark:bg-dark-background-secondary dark:text-dark-text-primary block w-full h-12 px-2 py-4 text-sm transition-colors duration-200 text-text-primary rounded-lg border border-border-primary dark:border-dark-border-primary appearance-none focus:outline-none focus:ring-0 focus:border-primary-600 dark:focus:border-primary-500 peer"
    />
  `,
})
export class InputComponent {
  public readonly control = input.required<FormControl>();
  public readonly id = input.required<string>();
  public readonly type = input<InputType>('text');
  public readonly placeholder = input('');
}
