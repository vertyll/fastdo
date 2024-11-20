import { Component, Input, inject } from '@angular/core';
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
            {{ validation.getValidatorErrorMessage(error, input) }}
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
  protected readonly validation = inject(ValidationService);

  @Input() input!: AbstractControl | null;
  @Input() customMessage!: string | undefined;

  getErrorKeys(errors: any): string[] {
    return errors ? Object.keys(errors) : [];
  }
}
