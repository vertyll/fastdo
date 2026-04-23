import { Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputType } from '../../defs/components.defs';
import { ButtonComponent } from '../atoms/button.component';
import { InputComponent } from '../atoms/input.component';

@Component({
  selector: 'app-submit-text',
  imports: [InputComponent, ButtonComponent, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="flex items-center gap-4">
      <app-input
        [control]="control()"
        [placeholder]="placeholder()"
        [type]="type()"
        type="text"
        id="submitTextInput"
      ></app-input>
      <app-button (clicked)="emitText()">
        {{ 'Basic.add' | translate }}
      </app-button>
    </div>
  `,
})
export class SubmitTextComponent {
  public readonly placeholder = input<string>('');
  public readonly type = input<InputType>('text');
  public readonly control = input<FormControl>(new FormControl());
  public readonly submitText = output<string>();

  protected emitText(): void {
    const text = this.control().value?.trim();
    if (text) {
      this.submitText.emit(text);
      this.control().reset();
    }
  }
}
