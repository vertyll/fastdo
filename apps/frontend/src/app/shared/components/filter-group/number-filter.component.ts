import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-number-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <input type="number" [formControl]="control" [id]="id" placeholder="" />
      <label [for]="id">{{ label }}</label>
    </div>
  `,
})
export class NumberFilterComponent {
  @Input()
  control!: FormControl;
  @Input()
  id!: string;
  @Input()
  label!: string;
}
