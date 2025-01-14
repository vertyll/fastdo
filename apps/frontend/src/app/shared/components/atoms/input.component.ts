import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputType } from '../../types/components.type';

@Component({
  selector: 'app-input',
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <input
      [type]="type()"
      [formControl]="control()"
      [id]="id()"
      [placeholder]="placeholder()"
      [ngClass]="{
        'pb-3 pt-3.5': type() !== 'date',
        'pb-1.5 pt-3': type() === 'date',
      }"
      class="block w-full px-2 text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-orange-600 peer"
    />
  `,
})
export class InputComponent {
  readonly control = input.required<FormControl>();
  readonly id = input.required<string>();
  readonly type = input<InputType>('text');
  readonly placeholder = input('');
}
