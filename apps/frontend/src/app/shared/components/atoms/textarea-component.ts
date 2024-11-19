import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <textarea
      [id]="id"
      [formControl]="control"
      [placeholder]="placeholder"
      [rows]="rows"
      class="block w-full p-1 text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-orange-600 peer"
    ></textarea>
  `,
})
export class TextareaComponent {
  @Input() id!: string;
  @Input() control!: FormControl;
  @Input() placeholder: string = '';
  @Input() rows: number = 3;
}
