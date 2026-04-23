import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LabelComponent } from '../atoms/label.component';
import { SelectFilterComponent } from '../atoms/select.component';

@Component({
  selector: 'app-select-field',
  imports: [ReactiveFormsModule, SelectFilterComponent, LabelComponent],
  template: `
    <div class="relative">
      <app-label [forId]="id()" [isFloating]="isFloating()">{{ label() }}</app-label>
      <app-select [control]="control()" [id]="id()" [options]="options()" [placeholder]="placeholder()" />
    </div>
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
