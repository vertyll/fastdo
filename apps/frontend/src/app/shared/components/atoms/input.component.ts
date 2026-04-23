import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InputType } from '../../defs/components.defs';

@Component({
  selector: 'app-input',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline" class="w-full">
      <mat-label>{{ label() }}</mat-label>
      <input matInput [type]="type()" [formControl]="control()" [id]="id()" [placeholder]="placeholder()" />
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
export class InputComponent {
  public readonly control = input.required<FormControl>();
  public readonly id = input.required<string>();
  public readonly type = input<InputType>('text');
  public readonly placeholder = input('');
  public readonly label = input<string>('');
}
