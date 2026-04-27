import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { LinkComponent } from '../shared/components/atoms/link.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { LinkTypeEnum } from '../shared/enums/link-type.enum';
import { ToastPositionEnum } from '../shared/enums/toast-position.enum';
import { ToastService } from '../shared/services/toast.service';
import { AuthService } from './data-access/auth.service';
import { InputFieldComponent } from '../shared/components/molecules/input-field.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    ErrorMessageComponent,
    LinkComponent,
    TitleComponent,
    RouterLink,
    InputFieldComponent,
  ],
  template: `
    <div
      class="max-w-xl mx-auto p-6 border border-border-primary dark:border-dark-border-primary rounded-lg shadow-md mt-10 bg-background-primary dark:bg-dark-background-primary"
    >
      <app-title [text]="'Auth.forgotPassword' | translate"></app-title>
      <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="mt-4">
        <app-input-field
          [label]="'Auth.email' | translate"
          [control]="getFormControl('email')"
          [type]="'email'"
          [id]="'email'"
          [errorMessage]="getEmailErrorMessage()"
        ></app-input-field>

        @if (errorMessage) {
          <app-error-message [customMessage]="errorMessage" />
        }

        <button
          type="submit"
          class="mt-4 submit-button w-full py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
        >
          {{ 'Auth.sendResetLink' | translate }}
        </button>

        <app-link class="mt-4 block" [routerLink]="['/login']" [linkType]="LinkTypeEnum.Default">
          {{ 'Auth.backToLogin' | translate }}
        </app-link>
      </form>
    </div>
  `,
})
export class ForgotPasswordComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly translateService = inject(TranslateService);
  private readonly toastService = inject(ToastService);

  protected readonly LinkTypeEnum = LinkTypeEnum;

  protected forgotPasswordForm!: FormGroup;
  protected emailErrors: string[] = [];
  protected errorMessage: string | null = null;

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.forgotPasswordForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
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
          if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = this.translateService.instant('Auth.unknownError');
          }
        },
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }

  protected getFormControl(name: string): FormControl {
    return this.forgotPasswordForm.get(name) as FormControl;
  }

  protected getEmailErrorMessage(): string {
    const control = this.forgotPasswordForm.get('email');
    if (!control?.touched) return '';
    if (control.hasError('required')) {
      return this.translateService.instant('Auth.emailRequired');
    }
    if (control.hasError('email')) {
      return this.translateService.instant('Auth.emailInvalid');
    }
    return '';
  }

  private initializeForm(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  private updateFormErrors(): void {
    this.errorMessage = null;
    this.emailErrors = this.getEmailErrors();
  }

  private getControlErrors(
    controlName: string,
    errorKeyMap: Record<string, string>,
    checkTouched: boolean = false,
  ): string[] {
    const control = this.forgotPasswordForm.get(controlName);
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

  private getEmailErrors(): string[] {
    return this.getControlErrors('email', {
      required: 'Auth.emailRequired',
      email: 'Auth.emailInvalid',
    });
  }
}
