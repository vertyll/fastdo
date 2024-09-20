import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const password = control.value;
  if (!password) {
    return null;
  }
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isValidLength = password.length >= 8;

  const errors: ValidationErrors = {};
  if (!hasUpperCase) {
    errors['uppercase'] = true;
  }
  if (!hasSpecialCharacter) {
    errors['specialCharacter'] = true;
  }
  if (!isValidLength) {
    errors['minlength'] = true;
  }

  return Object.keys(errors).length ? errors : null;
}
