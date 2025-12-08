import { Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  imports: [ReactiveFormsModule],
  template: `
    <input
      type="checkbox"
      [id]="id()"
      [checked]="checked()"
      [formControl]="control()"
      [value]="value()"
      (change)="onChange($event)"
      class="form-check-input h-4 w-4 text-primary-600 border-border-primary dark:border-dark-border-primary rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:bg-neutral-700 dark:text-dark-text-primary transition-colors duration-200"
    />
  `,
})
export class CheckboxComponent {
  readonly control = input.required<FormControl>();
  readonly id = input.required<string>();
  readonly checked = input(false);
  readonly value = input<any>();

  readonly changed = output<{
    value: any;
    checked: boolean;
  }>();

  protected onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.control().setValue(target.checked);
    this.changed.emit({ value: target.value, checked: target.checked });
  }
}
