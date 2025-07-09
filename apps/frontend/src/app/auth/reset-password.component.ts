import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { LabelComponent } from '../shared/components/atoms/label.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { ToastPositionEnum } from '../shared/enums/toast-position.enum';
import { ToastService } from '../shared/services/toast.service';
import { AuthService } from './data-access/auth.service';
import { PasswordValidator } from './validators/password.validator';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    ErrorMessageComponent,
    TitleComponent,
    LabelComponent,
  ],
  template: `
    <div class="max-w-md mx-auto p-spacing-6 border border-border-primary dark:border-dark-border-primary rounded-borderRadius-lg shadow-boxShadow-md mt-spacing-10 bg-surface-primary dark:bg-dark-surface-primary">
      <app-title>{{ 'Auth.resetPassword' | translate }}</app-title>
      <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()">
        <app-label forId="password">{{ 'Auth.newPassword' | translate }}:</app-label>
        <input
          id="password"
          type="password"
          formControlName="password"
          required
          class="input-field mb-spacing-4 p-spacing-2 border border-border-primary dark:border-dark-border-primary rounded-borderRadius-md w-full bg-background-primary dark:bg-dark-background-primary text-text-primary dark:text-dark-text-primary transition-colors duration-transitionDuration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
        />

        <app-label forId="confirmPassword">
          {{ 'Auth.confirmNewPassword' | translate }}:
        </app-label>
        <input
          id="confirmPassword"
          type="password"
          formControlName="confirmPassword"
          required
          class="input-field mb-spacing-4 p-spacing-2 border border-border-primary dark:border-dark-border-primary rounded-borderRadius-md w-full bg-background-primary dark:bg-dark-background-primary text-text-primary dark:text-dark-text-primary transition-colors duration-transitionDuration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
        />

        @if (passwordMismatch) {
          <app-error-message
            [customMessage]="'Auth.passwordDoNotMatch' | translate"
          />
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
          class="submit-button w-full py-spacing-2 bg-primary-500 text-white rounded-borderRadius-md hover:bg-primary-600 focus:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:bg-primary-700 dark:focus:ring-primary-800 transition-colors duration-transitionDuration-200"
        >
          {{ 'Auth.resetPasswordButton' | translate }}
        </button>
      </form>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  protected readonly router = inject(Router);
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
      this.checkPasswords();
      this.errorMessage = null;
      this.passwordErrors = this.getPasswordErrors();
    });
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
          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = this.translateService.instant(
              'Auth.unknownError',
            );
          }
        },
      });
    } else {
      this.resetPasswordForm.markAllAsTouched();
    }
  }

  private checkPasswords(): void {
    const password = this.resetPasswordForm.get('password')?.value;
    const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value;
    this.passwordMismatch = password !== confirmPassword;
  }

  private getPasswordErrors(): string[] {
    const passwordControl = this.resetPasswordForm.get('password');
    const errors: string[] = [];
    if (passwordControl?.hasError('required')) {
      errors.push(this.translateService.instant('Auth.passwordRequired'));
    }
    if (passwordControl?.hasError('minlength')) {
      errors.push(this.translateService.instant('Auth.passwordMinLength'));
    }
    if (passwordControl?.hasError('uppercase')) {
      errors.push(this.translateService.instant('Auth.passwordUppercase'));
    }
    if (passwordControl?.hasError('specialCharacter')) {
      errors.push(
        this.translateService.instant('Auth.passwordSpecialCharacter'),
      );
    }
    return errors;
  }
}
