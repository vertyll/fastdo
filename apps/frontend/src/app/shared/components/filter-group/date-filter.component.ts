import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <input type="date" [id]="id" [formControl]="control" placeholder=" " />
      <label [for]="id">
        {{ label }}
      </label>
    </div>
  `,
})
export class DateFilterComponent {
  @Input()
  control!: FormControl;
  @Input()
  id!: string;
  @Input()
  label!: string;
}
