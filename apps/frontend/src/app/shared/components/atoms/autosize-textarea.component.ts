import { AfterViewInit, Component, ElementRef, ViewChild, input, output } from '@angular/core';

@Component({
  selector: 'app-autosize-textarea',
  template: `
    <textarea
      #textarea
      [placeholder]="placeholder()"
      [value]="value()"
      class="resize-y overflow-auto focus:outline-orange-500 w-full bg-gray-100 dark:bg-gray-700 dark:text-white transition-colors duration-200 min-h-[100px]"
      (click)="$event.stopPropagation()"
      (keyup.enter)="emit(textarea)"
      (input)="calcHeight(textarea)"
    ></textarea>
  `,
  styles: [`
    textarea {
      box-sizing: border-box;
      padding: 8px;
      line-height: 1.5;
    }
  `],
})
export class AutosizeTextareaComponent implements AfterViewInit {
  @ViewChild('textarea')
  textareaRef!: ElementRef<HTMLTextAreaElement>;

  readonly placeholder = input<string>('');
  readonly value = input<string>('');
  readonly clearAfterEmit = input<boolean>(false);

  readonly submitText = output<string>();

  ngAfterViewInit() {
    this.calcHeight(this.textareaRef.nativeElement);
  }

  public submit(): void {
    this.emit(this.textareaRef.nativeElement);
  }

  protected emit(textarea: HTMLTextAreaElement): void {
    this.submitText.emit(textarea.value.trim());

    if (this.clearAfterEmit()) {
      textarea.value = '';
      this.calcHeight(textarea);
    }
  }

  protected calcHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';

    const newHeight = Math.max(100, textarea.scrollHeight);
    textarea.style.height = newHeight + 'px';
  }
}
