
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <button
      [type]="type"
      (click)="onClick.emit($event)"
      [disabled]="disabled"
      class="px-4 py-2 rounded-lg focus:outline-none bg-orange-500 text-white hover:bg-orange-600"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled: boolean | undefined = false;

  @Output() onClick: EventEmitter<Event> = new EventEmitter<Event>();
}
