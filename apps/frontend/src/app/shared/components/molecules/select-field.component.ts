import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectFilterComponent } from '../atoms/select.component';

@Component({
  selector: 'app-select-field',
  imports: [ReactiveFormsModule, SelectFilterComponent],
  template: `
    <app-select
      [control]="control()"
      [id]="id()"
      [options]="options()"
      [placeholder]="placeholder()"
      [label]="label()"
    />
  `,
})
export class SelectFieldComponent {
  public readonly control = input.required<FormControl>();
  public readonly id = input.required<string>();
  public readonly label = input.required<string>();
  public readonly placeholder = input<string>('');
  public readonly isFloating = input<boolean>(true);
  public readonly options = input<
    Array<{
      value: any;
      label: string;
    }>
  >([]);
}
