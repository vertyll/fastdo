import { Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-checkbox',
  imports: [ReactiveFormsModule, MatCheckboxModule],
  template: `
    <mat-checkbox [id]="id()" [formControl]="control()" [value]="value()" (change)="onChange($event)"></mat-checkbox>
  `,
})
export class CheckboxComponent {
  public readonly control = input.required<FormControl>();
  public readonly id = input.required<string>();
  public readonly checked = input(false);
  public readonly value = input<any>();

  public readonly changed = output<{
    value: any;
    checked: boolean;
  }>();

  protected onChange(event: MatCheckboxChange): void {
    this.control().setValue(event.checked);
    this.changed.emit({ value: this.value(), checked: event.checked });
  }
}
