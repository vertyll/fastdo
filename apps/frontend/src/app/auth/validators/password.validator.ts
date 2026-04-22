import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

const UPPERCASE_REGEX = /[A-Z]/;
const SPECIAL_CHARACTER_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

@Injectable({
  providedIn: 'root',
})
export class PasswordValidator {
  public validatePassword(control: AbstractControl): ValidationErrors | null {
    const password = control.value;

    if (!password) {
      return null;
    }

    const hasUpperCase = UPPERCASE_REGEX.test(password);
    const hasSpecialCharacter = SPECIAL_CHARACTER_REGEX.test(password);
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
}
