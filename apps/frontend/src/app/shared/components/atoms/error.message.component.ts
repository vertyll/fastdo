import { Component, inject, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ErrorPipe } from '../../pipes/error.pipe';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'app-error-message',
  imports: [ErrorPipe],
  template: `
    @if (input() && input()!.invalid && (input()!.touched || input()!.dirty)) {
      <p class="text-danger-500">
        @for (error of input()!.errors | error; track $index) {
          <span>
            {{ validation.getValidatorErrorMessage(error, input()!) }}
          </span>
        }
      </p>
    }
    @if (customMessage() !== null && customMessage() !== undefined) {
      <p class="text-danger-500" [innerHtml]="customMessage()"></p>
    }
  `,
})
export class ErrorMessageComponent {
  protected readonly validation = inject(ValidationService);
  readonly input = input<AbstractControl | null>();
  readonly customMessage = input<string | undefined>();
}
