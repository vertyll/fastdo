import { Injectable, inject } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessagesConfig } from '../types/validation.type';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  private readonly translate = inject(TranslateService);

  public getValidatorErrorMessage(validatorName: keyof MessagesConfig, input?: AbstractControl | null): string {
    const errorDetails = input?.errors?.[validatorName as string];

    switch (validatorName) {
      case 'required':
        return this.translate.instant('FormValidationMessage.required');
      case 'email':
        return this.translate.instant('FormValidationMessage.email');
      case 'min':
        return this.translate.instant('FormValidationMessage.min', { minValue: errorDetails?.min });
      case 'max':
        return this.translate.instant('FormValidationMessage.max', { maxValue: errorDetails?.max });
      case 'maxlength':
        return this.translate.instant('FormValidationMessage.maxLength');
      case 'minlength':
        return this.translate.instant('FormValidationMessage.minLength', { minLength: errorDetails?.requiredLength });
      case 'pattern':
        return this.translate.instant('FormValidationMessage.pattern');
      case 'passwordMatch':
        return this.translate.instant('FormValidationMessage.passwordMatch');
      case 'mismatchingPasswords':
        return this.translate.instant('FormValidationMessage.mismatchingPasswords');
      case 'custom':
        if (!errorDetails) return '';
        return Array.isArray(errorDetails) ? errorDetails.join(', ') : String(errorDetails);
      default:
        return '';
    }
  }
}
