import {Component, input, output} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

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
      class="form-check-input h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
    />
  `
})
export class CheckboxComponent {
  readonly control = input.required<FormControl>();
  readonly id = input.required<string>();
  readonly checked = input(false);
  readonly value = input<any>();

  readonly change = output<{
    value: any;
    checked: boolean;
  }>();

  protected onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.control().setValue(target.checked);
    this.change.emit({value: target.value, checked: target.checked});
  }
}
