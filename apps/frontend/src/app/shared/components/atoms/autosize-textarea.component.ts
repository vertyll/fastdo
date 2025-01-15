import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-autosize-textarea',
  template: `
    <textarea
      #textarea
      [placeholder]="placeholder()"
      [value]="value()"
      class="resize-none overflow-hidden focus:outline-orange-500 w-full dark:bg-gray-700 dark:text-white transition-colors duration-200"
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

  readonly submitText = output<string>();

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
