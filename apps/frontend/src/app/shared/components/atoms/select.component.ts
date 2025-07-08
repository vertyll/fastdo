import { Component, OnInit, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-select',
  imports: [ReactiveFormsModule],
  template: `
    <select
      [formControl]="control()"
      [id]="id()"
      class="bg-background-secondary dark:bg-dark-background-secondary transition-colors duration-200 dark:text-dark-text-primary block px-2.5 pb-2.5 pt-4 w-full text-sm text-text-primary rounded-lg border border-border-primary dark:border-dark-border-primary appearance-none focus:outline-none focus:ring-0 focus:border-primary-600 dark:focus:border-primary-500 peer"
    >
      @if (placeholder()) {
        <option value="">{{ placeholder() }}</option>
      }
      @for (option of options(); track $index) {
        <option [value]="option.value">
          {{ option.label }}
        </option>
      }
    </select>
  `,
})
export class SelectFilterComponent {
  readonly control = input.required<FormControl>();
  readonly id = input.required<string>();
  readonly placeholder = input<string>('');
  readonly options = input<
    Array<{
      value: any;
      label: string;
    }>
  >([]);
}
