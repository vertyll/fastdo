import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { InputComponent } from '../atoms/input.component';
import { LabelComponent } from '../atoms/label.component';
import { InputType } from '../../types/components.type';

@Component({
    selector: 'app-input-field',
    imports: [InputComponent, LabelComponent],
    template: `
    <div class="relative">
      <app-input [type]="type" [control]="control" [id]="id" />
      <app-label [forId]="id" [isField]="true">{{ label }}</app-label>
    </div>
  `
})
export class InputFieldComponent {
  @Input() control!: FormControl;
  @Input() id!: string;
  @Input() label!: string;
  @Input() type: InputType = 'text';
}
