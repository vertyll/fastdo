import { Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { InputType } from '../../defs/components.defs';
import { InputComponent } from '../atoms/input.component';
import { LabelComponent } from '../atoms/label.component';

@Component({
  selector: 'app-input-field',
  imports: [InputComponent, LabelComponent],
  template: `
    <div class="relative">
      <app-label [forId]="id()" [isFloating]="isFloating()">{{ label() }}</app-label>
      <app-input [type]="type()" [control]="control()" [id]="id()" />
    </div>
  `,
})
export class InputFieldComponent {
  public readonly control = input.required<FormControl>();
  public readonly id = input.required<string>();
  public readonly label = input.required<string>();
  public readonly type = input<InputType>('text');
  public readonly isFloating = input<boolean>(true);
}
