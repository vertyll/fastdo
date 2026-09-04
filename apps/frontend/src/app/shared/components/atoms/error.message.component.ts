import { Component, computed, inject, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ErrorPipe } from '../../pipes/error.pipe';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'app-error-message',
  imports: [ErrorPipe, TranslatePipe],
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
    @if (messageKey(); as key) {
      <p class="text-danger-500">{{ key | translate }}</p>
    } @else if (text()) {
      <p class="text-danger-500" [innerHtml]="text()"></p>
    }
  `,
})
export class ErrorMessageComponent {
  protected readonly validation = inject(ValidationService);

  public readonly input = input<AbstractControl | null>();
  public readonly customMessage = input<string | null | undefined>();
  public readonly messageKey = input<string | null | undefined>();
  public readonly fallbackMessage = input<string>('');

  protected readonly text = computed(() => this.customMessage() ?? this.fallbackMessage());
}
