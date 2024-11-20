
import { Component, Output, EventEmitter, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-button',
    imports: [TranslateModule],
    template: `
    <button
      [type]="type()"
      (click)="onClick.emit($event)"
      [disabled]="disabled()"
      class="px-4 py-2 rounded-lg focus:outline-none bg-orange-500 text-white hover:bg-orange-600"
    >
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input<boolean | undefined>(false);

  @Output() onClick: EventEmitter<Event> = new EventEmitter<Event>();
}
