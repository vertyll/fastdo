import { Component, EventEmitter, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-submit-text',
  imports: [TranslateModule],
  standalone: true,
  template: `
    <div>
      <input
        #textInput
        (keyup.enter)="submitText.emit(textInput.value); textInput.value = ''"
        class="border-b border-b-orange-400 outline-none"
      />
      <button
        (click)="submitText.emit(textInput.value); textInput.value = ''"
        class="border border-orange-400 ml-4 px-4"
      >
        {{ 'Base.add' | translate }}
      </button>
    </div>
  `,
  styles: [
    `
      input:focus + button {
        @apply text-orange-400;
      }
    `,
  ],
})
export class SubmitTextComponent {
  @Output() submitText: EventEmitter<string> = new EventEmitter<string>();
}
