import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  template: `
    <button
      [type]="type"
      (click)="onClick.emit($event)"
      [ngClass]="cssClass"
      class="px-4 py-2 rounded-lg focus:outline-none bg-orange-400 text-white hover:bg-orange-500"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() cssClass: string = '';

  @Output() onClick: EventEmitter<Event> = new EventEmitter<Event>();
}
