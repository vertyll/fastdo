import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-textarea',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
      @if (label()) {
        <mat-label>{{ label() }}</mat-label>
      }
      <textarea
        matInput
        [id]="id()"
        [formControl]="control()"
        [placeholder]="placeholder()"
        [rows]="rows()"
        [readonly]="readonly()"
        [disabledInteractive]="disabledInteractive()"
      ></textarea>
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
export class TextareaComponent {
  public readonly id = input.required<string>();
  public readonly control = input.required<FormControl>();
  public readonly placeholder = input<string>('');
  public readonly rows = input<number>(3);
  public readonly label = input<string>('');
  public readonly readonly = input<boolean>(false);
  public readonly disabledInteractive = input<boolean>(false);
}
