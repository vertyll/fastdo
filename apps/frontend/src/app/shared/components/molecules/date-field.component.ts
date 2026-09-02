import { Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DateInputComponent } from '../atoms/date-input.component';

@Component({
  selector: 'app-date-field',
  imports: [DateInputComponent, MatFormFieldModule],
  template: `
    <app-date-input
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
    </app-date-input>
  `,
})
export class DateFieldComponent {
  public readonly control = input.required<FormControl>();
  public readonly id = input.required<string>();
  public readonly label = input.required<string>();
  public readonly hint = input<string>('');
  public readonly errorMessage = input<string>('');
  public readonly placeholder = input<string>('');
  public readonly readonly = input<boolean>(false);
  public readonly disabledInteractive = input<boolean>(false);
  public readonly errorStateMatcher = input<ErrorStateMatcher | null>(null);
}
