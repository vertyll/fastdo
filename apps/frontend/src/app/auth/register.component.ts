import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationType } from 'src/app/shared/enums/notification.enum';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { LabelComponent } from '../shared/components/atoms/label.component';
import { LinkComponent } from '../shared/components/atoms/link.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { LinkType } from '../shared/enums/link.enum';
import { AuthService } from './data-access/auth.service';
import { PasswordValidator } from './validators/password.validator';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    ErrorMessageComponent,
    LinkComponent,
    TitleComponent,
    LabelComponent,
  ],
  template: `
    <div
      class="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-md mt-10"
    >
      <app-title>{{ 'Auth.register' | translate }}</app-title>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <app-label forId="email">{{ 'Auth.email' | translate }}:</app-label>
        <input
          id="email"
          formControlName="email"
          required
          class="input-field mb-4 p-2 border border-gray-300 rounded w-full dark:bg-gray-700 dark:text-white transition-colors duration-200"
        />
        <app-label forId="password">{{ 'Auth.password' | translate }}:</app-label>
        <input
          id="password"
          type="password"
          formControlName="password"
          required
          class="input-field mb-4 p-2 border border-gray-300 rounded w-full dark:bg-gray-700 dark:text-white transition-colors duration-200"
        />
        <app-label forId="confirmPassword">
          {{ 'Auth.confirmPassword' | translate }}:
        </app-label>
        <input
          id="confirmPassword"
          type="password"
          formControlName="confirmPassword"
          required
          class="input-field mb-4 p-2 border border-gray-300 rounded w-full dark:bg-gray-700 dark:text-white transition-colors duration-200"
        />
        @if (emailErrors.length > 0) {
          @for (error of emailErrors; track error) {
            <app-error-message [customMessage]="error" />
          }
        }
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
          class="submit-button w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          {{ 'Auth.registerButton' | translate }}
        </button>
        <app-link
          class="mt-4 block"
          [routerLink]="['/login']"
          [linkType]="LinkType.Default"
          >{{ 'Auth.alreadyHaveAccount' | translate }}</app-link
        >
      </form>
    </div>
  `,
  styles: [],
})
export class RegisterComponent implements OnInit {
  protected readonly router = inject(Router);
  protected readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly translateService = inject(TranslateService);
  private readonly passwordValidator = inject(PasswordValidator);

  protected readonly registerForm: FormGroup;
  protected readonly LinkType = LinkType;
  protected passwordMismatch: boolean = false;
  protected passwordErrors: string[] = [];
  protected emailErrors: string[] = [];
  protected errorMessage: string | null = null;

  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator.validatePassword]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.registerForm.valueChanges.subscribe(() => {
      this.checkPasswords();
      this.errorMessage = null;
      this.passwordErrors = this.getPasswordErrors();
      this.emailErrors = this.getEmailErrors();
    });
  }

  protected onSubmit(): void {
    this.checkPasswords();

    if (this.registerForm.valid && !this.passwordMismatch) {
      const { email, password } = this.registerForm.value;
      this.authService.register({ email, password }).subscribe({
        next: () => {
          this.router.navigate(['/login']).then();
        },
        error: err => {
          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = this.translateService.instant(
              'Auth.unknownRegisterError',
            );
          }
        },
        complete: () => {
          this.notificationService.showNotification(
            this.translateService.instant('Auth.registerSuccess'),
            NotificationType.success,
          );
        },
      });
    }
  }

  private checkPasswords(): void {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    this.passwordMismatch = password !== confirmPassword;
  }

  private getPasswordErrors(): string[] {
    const passwordControl = this.registerForm.get('password');
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

  private getEmailErrors(): string[] {
    const emailControl = this.registerForm.get('email');
    const errors: string[] = [];
    if (emailControl?.hasError('required')) {
      errors.push(this.translateService.instant('Auth.emailRequired'));
    }
    if (emailControl?.hasError('email')) {
      errors.push(this.translateService.instant('Auth.emailInvalid'));
    }
    return errors;
  }
}
