import { Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextareaComponent } from '../atoms/textarea.component';

@Component({
  selector: 'app-textarea-field',
  imports: [TextareaComponent, MatFormFieldModule],
  template: `
    <app-textarea
      [control]="control()"
      [id]="id()"
      [rows]="rows()"
      [placeholder]="placeholder()"
      [label]="label() || ''"
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
    </app-textarea>
  `,
})
export class TextareaFieldComponent {
  public readonly control = input.required<FormControl>();
  public readonly id = input.required<string>();
  public readonly label = input<string>();
  public readonly placeholder = input<string>('');
  public readonly rows = input<number>(3);
  public readonly isFloating = input<boolean>(true);
  public readonly readonly = input<boolean>(false);
  public readonly disabledInteractive = input<boolean>(false);
  public readonly hint = input<string>('');
  public readonly errorMessage = input<string>('');
  public readonly errorStateMatcher = input<ErrorStateMatcher | null>(null);
}
