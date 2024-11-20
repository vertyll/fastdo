
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectFilterComponent } from '../atoms/select.component';
import { LabelComponent } from '../atoms/label.component';

@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SelectFilterComponent,
    LabelComponent
],
  template: `
    <div class="relative">
      <app-select [control]="control" [id]="id" [options]="options" />
      <app-label [forId]="id" [isField]="true">{{ label }}</app-label>
    </div>
  `,
})
export class SelectFieldComponent {
  @Input() control!: FormControl;
  @Input() id!: string;
  @Input() label!: string;
  @Input() options: Array<{ value: any; label: string }> = [];
}
