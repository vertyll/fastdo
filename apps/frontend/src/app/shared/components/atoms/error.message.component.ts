import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ValidationService } from '../../services/validation.service';
import { ErrorPipe } from '../../pipes/error.pipe';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [ErrorPipe],
  template: `
    @if (input && input.invalid && (input.touched || input.dirty)) {
      <p class="text-red-500">
        @for (error of input.errors | error; track $index) {
          <span>
            <small>{{
              validation.getValidatorErrorMessage(error, input)
            }}</small>
          </span>
        }
      </p>
    }

    @if (customMessage != null) {
      <p class="text-red-500" [innerHtml]="customMessage"></p>
    }
  `,
})
export class ErrorMessageComponent {
  @Input() input!: AbstractControl | null;
  @Input() customMessage!: string | undefined;

  constructor(public validation: ValidationService) {}

  getErrorKeys(errors: any): string[] {
    return errors ? Object.keys(errors) : [];
  }
}