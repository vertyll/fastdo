import { Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { InputType } from '../../types/components.type';
import { InputComponent } from '../atoms/input.component';
import { LabelComponent } from '../atoms/label.component';

@Component({
  selector: 'app-input-field',
  imports: [InputComponent, LabelComponent],
  template: `
    <div class="relative">
      <app-input [type]="type()" [control]="control()" [id]="id()" />
      <app-label [forId]="id()" [isField]="true">{{ label() }}</app-label>
    </div>
  `,
})
export class InputFieldComponent {
  readonly control = input.required<FormControl>();
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly type = input<InputType>('text');
}
