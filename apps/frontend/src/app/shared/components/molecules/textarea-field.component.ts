import { Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TextareaComponent } from '../atoms/textarea.component';
import { LabelComponent } from '../atoms/label.component';

@Component({
  selector: 'app-textarea-field',
  imports: [TextareaComponent, LabelComponent],
  template: `
    <div class="relative">
      <app-label [forId]="id()" [isFloating]="isFloating()">{{ label() }}</app-label>
      <app-textarea [control]="control()" [id]="id()" [rows]="rows()" [placeholder]="placeholder()" />
    </div>
  `,
})
export class TextareaFieldComponent {
  readonly control = input.required<FormControl>();
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly placeholder = input<string>('');
  readonly rows = input<number>(3);
  readonly isFloating = input<boolean>(true);
}
