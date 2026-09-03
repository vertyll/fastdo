import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-input',
  imports: [ReactiveFormsModule],
  template: `
    <input
      type="color"
      [id]="id()"
      [formControl]="control()"
      [title]="label()"
      [attr.aria-label]="label()"
      class="w-11 h-11 cursor-pointer border-0 p-0 overflow-hidden outline-none rounded-md hover:scale-105 transition-transform"
    />
  `,
  styles: [':host { display: inline-block }'],
})
export class ColorInputComponent {
  public readonly control = input.required<FormControl>();
  public readonly id = input.required<string>();
  public readonly label = input<string>('');
}
