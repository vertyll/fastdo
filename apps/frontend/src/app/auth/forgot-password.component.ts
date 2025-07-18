import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { LabelComponent } from '../shared/components/atoms/label.component';
import { LinkComponent } from '../shared/components/atoms/link.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { LinkTypeEnum } from '../shared/enums/link-type.enum';
import { ToastPositionEnum } from '../shared/enums/toast-position.enum';
import { ToastService } from '../shared/services/toast.service';
import { AuthService } from './data-access/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    ErrorMessageComponent,
    LinkComponent,
    TitleComponent,
    LabelComponent,
    RouterLink,
  ],
  template: `
    <div class="max-w-md mx-auto p-spacing-6 border border-border-primary dark:border-dark-border-primary rounded-borderRadius-lg shadow-boxShadow-md mt-spacing-10 bg-background-primary dark:bg-dark-background-primary">
      <app-title>{{ 'Auth.forgotPassword' | translate }}</app-title>
      <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
        <app-label forId="email">{{ 'Auth.email' | translate }}:</app-label>
        <input
          id="email"
          formControlName="email"
          required
          class="input-field mb-spacing-4 p-spacing-2 border border-border-primary dark:border-dark-border-primary rounded-borderRadius-md w-full bg-background-primary dark:bg-dark-background-primary text-text-primary dark:text-dark-text-primary transition-colors duration-transitionDuration-200"
        />

        @if (emailErrors.length > 0) {
          @for (error of emailErrors; track error) {
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
          {{ 'Auth.sendResetLink' | translate }}
        </button>

        <app-link
          class="mt-spacing-4 block"
          [routerLink]="['/login']"
          [linkType]="LinkType.Default"
        >
          {{ 'Auth.backToLogin' | translate }}
        </app-link>
      </form>
    </div>
  `,
})
export class ForgotPasswordComponent implements OnInit {
  protected readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly translateService = inject(TranslateService);
  private readonly toastService = inject(ToastService);

  protected readonly forgotPasswordForm: FormGroup;
  protected readonly LinkType = LinkTypeEnum;
  protected emailErrors: string[] = [];
  protected errorMessage: string | null = null;

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.forgotPasswordForm.valueChanges.subscribe(() => {
      this.errorMessage = null;
      this.emailErrors = this.getEmailErrors();
    });
  }

  protected onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.authService.forgotPassword(this.forgotPasswordForm.value).subscribe({
        next: () => {
          this.router.navigate(['/login']).then(() => {
            this.toastService.presentToast(
              this.translateService.instant('Auth.resetLinkSent'),
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
      this.forgotPasswordForm.markAllAsTouched();
    }
  }

  private getEmailErrors(): string[] {
    const emailControl = this.forgotPasswordForm.get('email');
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
