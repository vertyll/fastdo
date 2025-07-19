import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { LabelComponent } from '../shared/components/atoms/label.component';
import { LinkComponent } from '../shared/components/atoms/link.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { CheckboxComponent } from '../shared/components/atoms/checkbox.component';
import { LinkTypeEnum } from '../shared/enums/link-type.enum';
import { ToastPositionEnum } from '../shared/enums/toast-position.enum';
import { ToastService } from '../shared/services/toast.service';
import { AuthService } from './data-access/auth.service';
import { PasswordValidator } from './validators/password.validator';

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
  ],
  template: `
   <div
     class="max-w-md mx-auto p-spacing-6 border border-border-primary dark:border-dark-border-primary rounded-borderRadius-lg shadow-boxShadow-md mt-spacing-10 bg-background-primary dark:bg-dark-background-primary"
   >
     <app-title>{{ 'Auth.register' | translate }}</app-title>
     <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
       <app-label forId="email">{{ 'Auth.email' | translate }}:</app-label>
       <input
         id="email"
         formControlName="email"
         required
         class="input-field mb-spacing-4 p-spacing-2 border border-border-primary dark:border-dark-border-primary rounded-borderRadius-md w-full bg-background-primary dark:bg-dark-background-primary text-text-primary dark:text-dark-text-primary transition-colors duration-transitionDuration-200"
       />

       <app-label forId="password">{{ 'Auth.password' | translate }}:</app-label>
       <input
         id="password"
         type="password"
         formControlName="password"
         required
         class="input-field mb-spacing-4 p-spacing-2 border border-border-primary dark:border-dark-border-primary rounded-borderRadius-md w-full bg-background-primary dark:bg-dark-background-primary text-text-primary dark:text-dark-text-primary transition-colors duration-transitionDuration-200"
       />

       <app-label forId="confirmPassword">
         {{ 'Auth.confirmPassword' | translate }}:
       </app-label>
       <input
         id="confirmPassword"
         type="password"
         formControlName="confirmPassword"
         required
         class="input-field mb-spacing-4 p-spacing-2 border border-border-primary dark:border-dark-border-primary rounded-borderRadius-md w-full bg-background-primary dark:bg-dark-background-primary text-text-primary dark:text-dark-text-primary transition-colors duration-transitionDuration-200"
       />

       <div class="mb-spacing-1">
         <div class="flex items-center gap-2">
           <app-checkbox
             [control]="getControl('termsAccepted')"
             [id]="'terms'"
           />
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

       <div class="mb-spacing-4">
         <div class="flex items-center gap-2">
           <app-checkbox
             [control]="getControl('privacyPolicyAccepted')"
             [id]="'privacy'"
           />
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
         class="submit-button w-full py-spacing-2 bg-primary-500 text-white rounded-borderRadius-md hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
       >
         {{ 'Auth.registerButton' | translate }}
       </button>

       <app-link
         class="mt-spacing-4 block"
         [routerLink]="['/login']"
         [linkType]="LinkType.Default"
       >
         {{ 'Auth.alreadyHaveAccount' | translate }}
       </app-link>
     </form>
   </div>
 `,
})
export class RegisterComponent implements OnInit {
  protected readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly translateService = inject(TranslateService);
  private readonly passwordValidator = inject(PasswordValidator);
  private readonly toastService = inject(ToastService);

  protected readonly registerForm: FormGroup;
  protected readonly LinkType = LinkTypeEnum;
  protected passwordMismatch: boolean = false;
  protected passwordErrors: string[] = [];
  protected emailErrors: string[] = [];
  protected termsErrors: string[] = [];
  protected privacyPolicyErrors: string[] = [];
  protected errorMessage: string | null = null;

  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator.validatePassword]],
      confirmPassword: ['', [Validators.required]],
      termsAccepted: [false, [Validators.requiredTrue]],
      privacyPolicyAccepted: [false, [Validators.requiredTrue]],
    });
  }

  ngOnInit(): void {
    this.registerForm.valueChanges.subscribe(() => {
      this.checkPasswords();
      this.errorMessage = null;
      this.passwordErrors = this.getPasswordErrors();
      this.emailErrors = this.getEmailErrors();
      this.termsErrors = this.getTermsErrors();
      this.privacyPolicyErrors = this.getPrivacyPolicyErrors();
    });
  }

  protected getControl(name: string): FormControl {
    return this.registerForm.get(name) as FormControl;
  }

  protected onSubmit(): void {
    if (this.registerForm.valid && !this.passwordMismatch) {
      const { confirmPassword, ...dto } = this.registerForm.value;
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
          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = this.translateService.instant(
              'Auth.unknownRegisterError',
            );
          }
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
      this.termsErrors = this.getTermsErrors();
      this.privacyPolicyErrors = this.getPrivacyPolicyErrors();
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

  private getTermsErrors(): string[] {
    const termsControl = this.registerForm.get('termsAccepted');
    const errors: string[] = [];
    if (termsControl?.hasError('required') && termsControl.touched) {
      errors.push(this.translateService.instant('Auth.termsRequired'));
    }
    return errors;
  }

  private getPrivacyPolicyErrors(): string[] {
    const privacyControl = this.registerForm.get('privacyPolicyAccepted');
    const errors: string[] = [];
    if (privacyControl?.hasError('required') && privacyControl.touched) {
      errors.push(this.translateService.instant('Auth.privacyPolicyRequired'));
    }
    return errors;
  }
}
