import { AfterViewInit, Component, ElementRef, ViewChild, input, output } from '@angular/core';

@Component({
  selector: 'app-autosize-textarea',
  template: `
    <textarea
      #textarea
      [placeholder]="placeholder()"
      [value]="value()"
      class="resize-y overflow-auto focus:outline-primary-500 w-full bg-background-secondary dark:bg-dark-background-secondary dark:text-dark-text-primary transition-colors duration-200 min-h-[100px] p-2 rounded-lg border border-border-primary dark:border-dark-border-primary"
      (click)="$event.stopPropagation()"
      (keyup.enter)="emit(textarea)"
      (input)="calcHeight(textarea)"
    ></textarea>
  `,
  styles: [
    `
      textarea {
        box-sizing: border-box;
        padding: 8px;
        line-height: 1.5;
      }
    `,
  ],
})
export class AutosizeTextareaComponent implements AfterViewInit {
  @ViewChild('textarea')
  textareaRef!: ElementRef<HTMLTextAreaElement>;

  readonly placeholder = input<string>('');
  readonly value = input<string>('');
  readonly clearAfterEmit = input<boolean>(false);

  readonly submitText = output<string>();

  ngAfterViewInit(): void {
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
