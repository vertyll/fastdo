import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CheckboxComponent } from '../shared/components/atoms/checkbox.component';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { LabelComponent } from '../shared/components/atoms/label.component';
import { LinkComponent } from '../shared/components/atoms/link.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { LinkTypeEnum } from '../shared/enums/link-type.enum';
import { ToastPositionEnum } from '../shared/enums/toast-position.enum';
import { ToastService } from '../shared/services/toast.service';
import { AuthService } from './data-access/auth.service';
import { PasswordValidator } from './validators/password.validator';
import { InputFieldComponent } from '../shared/components/molecules/input-field.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    ErrorMessageComponent,
    LinkComponent,
    TitleComponent,
    LabelComponent,
    RouterLink,
    CheckboxComponent,
    InputFieldComponent,
  ],
  template: `
    <div
      class="max-w-md mx-auto p-6 border border-border-primary dark:border-dark-border-primary rounded-lg shadow-md mt-10 bg-background-primary dark:bg-dark-background-primary"
    >
      <app-title [text]="'Auth.register' | translate"></app-title>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="mt-4">
        <div class="flex flex-col gap-4">
          <app-input-field
            [label]="'Auth.email' | translate"
            [control]="getControl('email')"
            [type]="'email'"
            [id]="'email'"
          ></app-input-field>
          <app-input-field
            [label]="'Auth.password' | translate"
            [control]="getControl('password')"
            [type]="'password'"
            [id]="'password'"
          ></app-input-field>
          <app-input-field
            [label]="'Auth.confirmPassword' | translate"
            [control]="getControl('confirmPassword')"
            [type]="'password'"
            [id]="'confirmPassword'"
          ></app-input-field>
        </div>

        <div class="mb-1 mt-4">
          <div class="flex items-center gap-2">
            <app-checkbox [control]="getControl('termsAccepted')" [id]="'terms'" />
            <app-label forId="terms" [required]="true">
              {{ 'Auth.acceptTerms' | translate }}
              <a
                class="text-link-primary hover:text-link-hover dark:text-link-dark-primary dark:hover:text-link-dark-hover hover:underline"
                [routerLink]="['/terms']"
              >
                {{ 'Auth.termsLink' | translate }}
              </a>
            </app-label>
          </div>
          @if (termsErrors.length > 0) {
            @for (error of termsErrors; track error) {
              <app-error-message [customMessage]="error" />
            }
          }
        </div>

        <div class="mb-4">
          <div class="flex items-center gap-2">
            <app-checkbox [control]="getControl('privacyPolicyAccepted')" [id]="'privacy'" />
            <app-label forId="privacy" [required]="true">
              {{ 'Auth.acceptPrivacyPolicy' | translate }}
              <a
                class="text-link-primary hover:text-link-hover dark:text-link-dark-primary dark:hover:text-link-dark-hover hover:underline"
                [routerLink]="['/privacy-policy']"
              >
                {{ 'Auth.privacyPolicyLink' | translate }}
              </a>
            </app-label>
          </div>
          @if (privacyPolicyErrors.length > 0) {
            @for (error of privacyPolicyErrors; track error) {
              <app-error-message [customMessage]="error" />
            }
          }
        </div>

        @if (emailErrors.length > 0) {
          @for (error of emailErrors; track error) {
            <app-error-message [customMessage]="error" />
          }
        }

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
          class="submit-button w-full py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
        >
          {{ 'Auth.registerButton' | translate }}
        </button>

        <app-link class="mt-4 block" [routerLink]="['/login']" [linkType]="LinkTypeEnum.Default">
          {{ 'Auth.alreadyHaveAccount' | translate }}
        </app-link>
      </form>
    </div>
  `,
})
export class RegisterComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly translateService = inject(TranslateService);
  private readonly passwordValidator = inject(PasswordValidator);
  private readonly toastService = inject(ToastService);

  protected readonly LinkTypeEnum = LinkTypeEnum;

  protected registerForm!: FormGroup;
  protected passwordMismatch: boolean = false;
  protected passwordErrors: string[] = [];
  protected emailErrors: string[] = [];
  protected termsErrors: string[] = [];
  protected privacyPolicyErrors: string[] = [];
  protected errorMessage: string | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.registerForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }

  protected getControl(name: string): FormControl {
    return this.registerForm.get(name) as FormControl;
  }

  protected onSubmit(): void {
    if (this.registerForm.valid && !this.passwordMismatch) {
      const { confirmPassword: _confirmPassword, ...dto } = this.registerForm.value;
      this.authService.register(dto).subscribe({
        next: () => {
          this.router.navigate(['/login']).then(() => {
            this.toastService.presentToast(
              this.translateService.instant('Auth.registerSuccess'),
              true,
              ToastPositionEnum.Relative,
            );
          });
        },
        error: err => {
          if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = this.translateService.instant('Auth.unknownRegisterError');
          }
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
      this.termsErrors = this.getTermsErrors();
      this.privacyPolicyErrors = this.getPrivacyPolicyErrors();
    }
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator.validatePassword]],
      confirmPassword: ['', [Validators.required]],
      termsAccepted: [false, [Validators.requiredTrue]],
      privacyPolicyAccepted: [false, [Validators.requiredTrue]],
    });
  }

  private updateFormErrors(): void {
    this.checkPasswords();
    this.errorMessage = null;
    this.passwordErrors = this.getPasswordErrors();
    this.emailErrors = this.getEmailErrors();
    this.termsErrors = this.getTermsErrors();
    this.privacyPolicyErrors = this.getPrivacyPolicyErrors();
  }

  private checkPasswords(): void {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    this.passwordMismatch = password !== confirmPassword;
  }

  private getControlErrors(
    controlName: string,
    errorKeyMap: Record<string, string>,
    checkTouched: boolean = false,
  ): string[] {
    const control = this.registerForm.get(controlName);
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

  private getEmailErrors(): string[] {
    return this.getControlErrors('email', {
      required: 'Auth.emailRequired',
      email: 'Auth.emailInvalid',
    });
  }

  private getTermsErrors(): string[] {
    return this.getControlErrors('termsAccepted', { required: 'Auth.termsRequired' }, true);
  }

  private getPrivacyPolicyErrors(): string[] {
    return this.getControlErrors('privacyPolicyAccepted', { required: 'Auth.privacyPolicyRequired' }, true);
  }
}
