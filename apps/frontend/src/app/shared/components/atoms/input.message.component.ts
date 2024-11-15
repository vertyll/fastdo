import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'app-input-message',
  standalone: true,
  template: `
    @if (input && input.invalid && (input.touched || input.dirty)) {
      <p class="text-red-500 text-xs italic">
        @for (error of input.errors || {}; track $index) {
          <span>
            <small>{{
              validation.getValidatorErrorMessage(error, input)
            }}</small>
          </span>
        }
      </p>
    }

    @if (customMessage != null) {
      <p class="text-red-500 text-xs italic" [innerHtml]="customMessage"></p>
    }
  `,
})
export class InputMessageComponent {
  @Input() input!: AbstractControl | null;
  @Input() customMessage!: string | null;

  constructor(public validation: ValidationService) {}
}
