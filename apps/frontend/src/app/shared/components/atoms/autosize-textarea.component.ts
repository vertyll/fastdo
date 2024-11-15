import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-autosize-textarea',
  standalone: true,
  template: `
    <textarea
      #textarea
      [placeholder]="placeholder"
      [value]="value"
      class="resize-none overflow-hidden focus:outline-orange-400 w-full"
      (click)="$event.stopPropagation()"
      (keyup.enter)="emit(textarea)"
      (input)="calcHeight(textarea)"
    ></textarea>
  `,
  styles: [],
})
export class AutosizeTextareaComponent {
  @Input() placeholder: string = '';
  @Input() value: string = '';
  @Input() clearAfterEmit: boolean = false;

  @Output() submitText: EventEmitter<string> = new EventEmitter<string>();

  protected emit(textarea: HTMLTextAreaElement): void {
    this.submitText.emit(textarea.value.trim());

    if (this.clearAfterEmit) {
      textarea.value = '';
    }
  }

  protected calcHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}
