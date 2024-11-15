import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessagesConfig } from '../interfaces/validation.interface';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  constructor(private readonly translate: TranslateService) {}

  public getValidatorErrorMessage(
    validatorName: keyof MessagesConfig,
    input?: any,
  ): string {
    const config: MessagesConfig = {
      required: this.translate.instant('FormValidationMessage.required'),
      email: this.translate.instant('FormValidationMessage.email'),
      min: this.translate.instant('FormValidationMessage.min', {
        minValue: input.errors?.min?.min,
      }),
      max: this.translate.instant('FormValidationMessage.max', {
        maxValue: input.errors?.max?.max,
      }),
      custom: Array.isArray(input.errors[validatorName])
        ? input.errors[validatorName].join(', ')
        : input.errors[validatorName],
      maxlength: this.translate.instant('FormValidationMessage.maxLength'),
      passwordMatch: this.translate.instant(
        'FormValidationMessage.passwordMatch',
      ),
      pattern: this.translate.instant('FormValidationMessage.pattern'),
      minlength: this.translate.instant('FormValidationMessage.minLength', {
        minLength: input.errors?.minlength?.requiredLength,
      }),
      mismatchingPasswords: this.translate.instant(
        'FormValidationMessage.mismatchingPasswords',
      ),
    };

    return config[validatorName];
  }
}
