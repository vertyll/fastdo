import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  template: `
    <input
      type="checkbox"
      [id]="id"
      [checked]="checked"
      [value]="value"
      (change)="onChange($event)"
      class="form-check-input h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
    />
  `,
})
export class CheckboxComponent {
  @Input() id!: string;
  @Input() checked = false;
  @Input() value!: any;

  @Output() change = new EventEmitter<{ value: any; checked: boolean }>();

  protected onChange(event: Event): void {
    this.change.emit({
      value: this.value,
      checked: (event.target as HTMLInputElement).checked,
    });
  }
}
