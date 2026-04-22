import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { ToastPositionEnum } from '../shared/enums/toast-position.enum';
import { ToastService } from '../shared/services/toast.service';
import { AuthService } from './data-access/auth.service';
import { PasswordValidator } from './validators/password.validator';
import { InputFieldComponent } from '../shared/components/molecules/input-field.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, ErrorMessageComponent, TitleComponent, InputFieldComponent],
  template: `
    <div
      class="max-w-md mx-auto p-6 border border-border-primary dark:border-dark-border-primary rounded-lg shadow-md mt-10 bg-surface-primary dark:bg-dark-surface-primary"
    >
      <app-title [text]="'Auth.resetPassword' | translate"></app-title>
      <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" class="mt-4">
        <div class="flex flex-col gap-4 mb-4">
          <app-input-field
            [label]="'Auth.newPassword' | translate"
            [control]="getControl('password')"
            [type]="'password'"
            [id]="'password'"
          ></app-input-field>
          <app-input-field
            [label]="'Auth.confirmNewPassword' | translate"
            [control]="getControl('confirmPassword')"
            [type]="'password'"
            [id]="'confirmPassword'"
          ></app-input-field>
        </div>

        @if (passwordMismatch) {
          <app-error-message [customMessage]="'Auth.passwordDoNotMatch' | translate" />
        }

        @if (passwordErrors.length > 0) {
          @for (error of passwordErrors; track error) {
            <app-error-message [customMessage]="error" />
          }
        }

        @if (errorMessage) {
          <app-error-message [customMessage]="errorMessage" />
        }

        <button
          type="submit"
          class="submit-button w-full py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:bg-primary-700 dark:focus:ring-primary-800 transition-colors duration-200"
        >
          {{ 'Auth.resetPasswordButton' | translate }}
        </button>
      </form>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly translateService = inject(TranslateService);
  private readonly passwordValidator = inject(PasswordValidator);
  private readonly toastService = inject(ToastService);

  protected readonly resetPasswordForm: FormGroup;
  protected passwordMismatch: boolean = false;
  protected passwordErrors: string[] = [];
  protected errorMessage: string | null = null;
  private token: string | null = null;

  constructor() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, this.passwordValidator.validatePassword]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.router.navigate(['/login']).then();
      }
    });

    this.resetPasswordForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }

  protected getControl(name: string): FormControl {
    return this.resetPasswordForm.get(name) as FormControl;
  }

  protected onSubmit(): void {
    if (this.resetPasswordForm.valid && !this.passwordMismatch && this.token) {
      const { password } = this.resetPasswordForm.value;
      this.authService.resetPassword({ token: this.token, password }).subscribe({
        next: () => {
          this.router.navigate(['/login']).then(() => {
            this.toastService.presentToast(
              this.translateService.instant('Auth.passwordResetSuccess'),
              true,
              ToastPositionEnum.Relative,
            );
          });
        },
        error: err => {
          if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = this.translateService.instant('Auth.unknownError');
          }
        },
      });
    } else {
      this.resetPasswordForm.markAllAsTouched();
    }
  }

  private updateFormErrors(): void {
    this.checkPasswords();
    this.errorMessage = null;
    this.passwordErrors = this.getPasswordErrors();
  }

  private checkPasswords(): void {
    const password = this.resetPasswordForm.get('password')?.value;
    const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value;
    this.passwordMismatch = password !== confirmPassword;
  }

  private getControlErrors(
    controlName: string,
    errorKeyMap: Record<string, string>,
    checkTouched: boolean = false,
  ): string[] {
    const control = this.resetPasswordForm.get(controlName);
    const errors: string[] = [];
    if (control && (!checkTouched || control.touched)) {
      for (const [error, translateKey] of Object.entries(errorKeyMap)) {
        if (control.hasError(error)) {
          errors.push(this.translateService.instant(translateKey));
        }
      }
    }
    return errors;
  }

  private getPasswordErrors(): string[] {
    return this.getControlErrors('password', {
      required: 'Auth.passwordRequired',
      minlength: 'Auth.passwordMinLength',
      uppercase: 'Auth.passwordUppercase',
      specialCharacter: 'Auth.passwordSpecialCharacter',
    });
  }
}
