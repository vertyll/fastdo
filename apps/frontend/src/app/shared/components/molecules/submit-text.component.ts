import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../atoms/input.component';
import { ButtonComponent } from '../atoms/button.component';

@Component({
  selector: 'app-submit-text',
  standalone: true,
  imports: [
    InputComponent,
    ButtonComponent,
    ReactiveFormsModule,
    TranslateModule,
  ],
  template: `
    <div class="flex items-center gap-4">
      <app-input
        [control]="control"
        placeholder="{{ 'Base.enterText' | translate }}"
        type="text"
        id="submitTextInput"
      ></app-input>
      <app-button
        (onClick)="emitText()"
        cssClass="bg-orange-400 text-white hover:bg-orange-500"
      >
        {{ 'Base.add' | translate }}
      </app-button>
    </div>
  `,
})
export class SubmitTextComponent {
  @Output() submitText: EventEmitter<string> = new EventEmitter<string>();
  protected control: FormControl = new FormControl('');

  protected emitText(): void {
    const text = this.control.value?.trim();
    if (text) {
      this.submitText.emit(text);
      this.control.reset();
    }
  }
}
