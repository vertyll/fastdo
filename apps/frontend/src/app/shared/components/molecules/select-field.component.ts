import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LabelComponent } from '../atoms/label.component';
import { SelectFilterComponent } from '../atoms/select.component';

@Component({
  selector: 'app-select-field',
  imports: [
    ReactiveFormsModule,
    SelectFilterComponent,
    LabelComponent,
  ],
  template: `
    <div class="relative">
      <app-select [control]="control()" [id]="id()" [options]="options()" [placeholder]="placeholder()" />
      <app-label [forId]="id()" [isField]="true">{{ label() }}</app-label>
    </div>
  `,
})
export class SelectFieldComponent {
  readonly control = input.required<FormControl>();
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly placeholder = input<string>('');
  readonly options = input<
    Array<{
      value: any;
      label: string;
    }>
  >([]);
}
