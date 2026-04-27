import { Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TextareaComponent } from '../atoms/textarea.component';

@Component({
  selector: 'app-textarea-field',
  imports: [TextareaComponent],
  template: `
    <app-textarea
      [control]="control()"
      [id]="id()"
      [rows]="rows()"
      [placeholder]="placeholder()"
      [label]="label()"
      [readonly]="readonly()"
      [disabledInteractive]="disabledInteractive()"
    />
  `,
})
export class TextareaFieldComponent {
  public readonly control = input.required<FormControl>();
  public readonly id = input.required<string>();
  public readonly label = input.required<string>();
  public readonly placeholder = input<string>('');
  public readonly rows = input<number>(3);
  public readonly isFloating = input<boolean>(true);
  public readonly readonly = input<boolean>(false);
  public readonly disabledInteractive = input<boolean>(false);
}
