import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-date-input',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
  template: `
    <mat-form-field appearance="fill" class="w-full" subscriptSizing="dynamic">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        [matDatepicker]="picker"
        [formControl]="control()"
        [id]="id()"
        [placeholder]="placeholder()"
        [readonly]="readonly()"
        [disabledInteractive]="disabledInteractive()"
        [errorStateMatcher]="errorStateMatcher() ?? defaultErrorStateMatcher"
      />
      <mat-datepicker-toggle matIconSuffix [for]="picker" />
      <mat-datepicker #picker />
      <ng-content select="mat-hint" />
      <ng-content select="mat-error" />
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      mat-form-field {
        width: 100%;
      }
    `,
  ],
})
export class DateInputComponent {
  public readonly control = input.required<FormControl>();
  public readonly id = input.required<string>();
  public readonly placeholder = input('');
  public readonly label = input<string>('');
  public readonly readonly = input<boolean>(false);
  public readonly disabledInteractive = input<boolean>(false);
  public readonly errorStateMatcher = input<ErrorStateMatcher | null>(null);

  protected readonly defaultErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: control => !!(control && control.invalid && (control.dirty || control.touched)),
  };
}
