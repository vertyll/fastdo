import { Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputType } from '../../defs/components.defs';
import { InputComponent } from '../atoms/input.component';

@Component({
  selector: 'app-input-field',
  imports: [InputComponent, MatFormFieldModule],
  template: `
    <app-input
      [type]="type()"
      [control]="control()"
      [id]="id()"
      [label]="label()"
      [placeholder]="placeholder()"
      [readonly]="readonly()"
      [disabledInteractive]="disabledInteractive()"
      [errorStateMatcher]="errorStateMatcher()"
    >
      @if (hint()) {
        <mat-hint>{{ hint() }}</mat-hint>
      }
      @if (errorMessage() && control().invalid && control().touched) {
        <mat-error>{{ errorMessage() }}</mat-error>
      }
    </app-input>
  `,
})
export class InputFieldComponent {
  public readonly control = input.required<FormControl>();
  public readonly id = input.required<string>();
  public readonly label = input.required<string>();
  public readonly type = input<InputType>('text');
  public readonly hint = input<string>('');
  public readonly errorMessage = input<string>('');
  public readonly placeholder = input<string>('');
  public readonly readonly = input<boolean>(false);
  public readonly disabledInteractive = input<boolean>(false);
  public readonly errorStateMatcher = input<ErrorStateMatcher | null>(null);
}
