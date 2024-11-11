import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <input type="text" [formControl]="control" [id]="id" placeholder="" />
      <label [for]="id">{{ label }}</label>
    </div>
  `,
})
export class TextFilterComponent {
  @Input()
  control!: FormControl;
  @Input()
  id!: string;
  @Input()
  label!: string;
}
