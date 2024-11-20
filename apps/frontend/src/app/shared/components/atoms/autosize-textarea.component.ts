import { Component, EventEmitter, Output, input } from '@angular/core';

@Component({
  selector: 'app-autosize-textarea',
  standalone: true,
  template: `
    <textarea
      #textarea
      [placeholder]="placeholder()"
      [value]="value()"
      class="resize-none overflow-hidden focus:outline-orange-500 w-full"
      (click)="$event.stopPropagation()"
      (keyup.enter)="emit(textarea)"
      (input)="calcHeight(textarea)"
    ></textarea>
  `,
  styles: [],
})
export class AutosizeTextareaComponent {
  readonly placeholder = input<string>('');
  readonly value = input<string>('');
  readonly clearAfterEmit = input<boolean>(false);

  @Output() submitText: EventEmitter<string> = new EventEmitter<string>();

  protected emit(textarea: HTMLTextAreaElement): void {
    this.submitText.emit(textarea.value.trim());

    if (this.clearAfterEmit()) {
      textarea.value = '';
    }
  }

  protected calcHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}
