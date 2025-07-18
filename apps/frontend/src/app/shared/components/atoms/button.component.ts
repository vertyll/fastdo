import { Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-button',
  imports: [TranslateModule],
  template: `
    <button
      [type]="type()"
      (click)="onClick.emit($event)"
      [disabled]="disabled()"
      [class]="getButtonClass()"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input<boolean | undefined>(false);
  readonly cssClass = input<string>('');

  readonly onClick = output<Event>();

  protected getButtonClass(): string {
    const baseClasses =
      'px-4 py-2 rounded-lg focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    const customClasses = this.cssClass();

    if (customClasses) {
      return `${baseClasses} ${customClasses}`;
    }

    return `${baseClasses} bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700`;
  }
}
