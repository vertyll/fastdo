import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../atoms/input.component';
import { ButtonComponent } from '../atoms/button.component';
import { InputType } from '../../types/components.type';

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
        [placeholder]="placeholder"
        [type]="type"
        type="text"
        id="submitTextInput"
      ></app-input>
      <app-button
        (onClick)="emitText()"
        cssClass="bg-orange-500 text-white hover:bg-orange-600"
      >
        {{ 'Basic.add' | translate }}
      </app-button>
    </div>
  `,
})
export class SubmitTextComponent {
  @Input() placeholder: string = '';
  @Input() type: InputType = 'text';
  @Input() control: FormControl = new FormControl();
  @Output() submitText: EventEmitter<string> = new EventEmitter<string>();

  protected emitText(): void {
    const text = this.control.value?.trim();
    if (text) {
      this.submitText.emit(text);
      this.control.reset();
    }
  }
}
