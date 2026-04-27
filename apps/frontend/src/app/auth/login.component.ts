import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { LinkComponent } from '../shared/components/atoms/link.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { LinkTypeEnum } from '../shared/enums/link-type.enum';
import { ToastPositionEnum } from '../shared/enums/toast-position.enum';
import { ToastService } from '../shared/services/toast.service';
import { AuthService } from './data-access/auth.service';
import { EmailChangeService } from './data-access/email-change.service';
import { InputFieldComponent } from '../shared/components/molecules/input-field.component';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    ErrorMessageComponent,
    LinkComponent,
    TitleComponent,
    InputFieldComponent,
  ],
  template: `
    <div
      class="max-w-xl mx-auto p-6 border border-border-primary dark:border-dark-border-primary rounded-lg shadow-md mt-10 bg-background-primary dark:bg-dark-background-primary"
    >
      <app-title [text]="'Auth.login' | translate"></app-title>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-4">
        <div class="flex flex-col gap-4">
          <app-input-field
            [label]="'Auth.email' | translate"
            [control]="getFormControl('email')"
            [type]="'email'"
            [id]="'email'"
            [errorMessage]="getErrorMessage('email')"
          ></app-input-field>
          <app-input-field
            [label]="'Auth.password' | translate"
            [control]="getFormControl('password')"
            [type]="'password'"
            [id]="'password'"
            [errorMessage]="'FormValidationMessage.required' | translate"
          ></app-input-field>
        </div>
        @if (errorMessage) {
          <app-error-message [customMessage]="errorMessage" />
        }
        <button
          type="submit"
          class="submit-button w-full py-2 mt-4 bg-primary-500 text-white rounded-md hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
        >
          {{ 'Auth.loginButton' | translate }}
        </button>
        <app-link class="mt-4 block" [routerLink]="['/register']" [linkType]="LinkTypeEnum.Default">{{
          'Auth.dontHaveAccount' | translate
        }}</app-link>
        <app-link class="mt-1 block" [routerLink]="['/forgot-password']" [linkType]="LinkTypeEnum.Default">
          {{ 'Auth.forgotPassword' | translate }}
        </app-link>
      </form>
    </div>
  `,
  styles: [],
})
export class LoginComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly translateService = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly emailChangeService = inject(EmailChangeService);

  protected readonly LinkTypeEnum = LinkTypeEnum;

  protected loginForm!: FormGroup;
  protected errorMessage: string | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.route.queryParams.subscribe(params => {
      this.handleEmailPrefill(params['email']);
      this.handleAccountConfirmation(params['confirmed']);
      this.handleEmailChange(params['emailChanged']);
      this.handleErrors(params['error']);
    });
  }

  protected onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/projects']).then();
        },
        error: err => {
          if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = this.translateService.instant('Auth.unknownLoginError');
          }
        },
      });
    }
  }

  protected getFormControl(name: string): FormControl {
    return this.loginForm.get(name) as FormControl;
  }

  protected getErrorMessage(name: string): string {
    const control = this.getFormControl(name);
    if (control.hasError('required')) {
      return this.translateService.instant('FormValidationMessage.required');
    }
    if (control.hasError('email')) {
      return this.translateService.instant('FormValidationMessage.email');
    }
    return '';
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  private handleEmailPrefill(email?: string): void {
    if (email) {
      this.loginForm.patchValue({ email });
    }
  }

  private handleAccountConfirmation(confirmed?: string): void {
    if (confirmed === 'true') {
      this.showTranslatedToast('Auth.emailConfirmed', true, ToastPositionEnum.Relative);
    }
  }

  private handleEmailChange(emailChanged?: string): void {
    if (emailChanged === 'true') {
      this.emailChangeService.handleEmailChange(true);
      this.showTranslatedToast('Auth.emailChanged', true);
    }
  }

  private handleErrors(error?: string): void {
    if (error === 'invalid_email_token') {
      this.showTranslatedToast('Auth.invalidEmailToken', false, ToastPositionEnum.Relative);
    }

    if (error === 'invalid_email_change_token') {
      this.showTranslatedToast('Auth.invalidEmailChangeToken', false, ToastPositionEnum.Relative);
    }
  }

  private showTranslatedToast(key: string, isSuccess: boolean, position?: ToastPositionEnum): void {
    this.translateService.get(key).subscribe((message: string): void => {
      this.toastService.presentToast(message, isSuccess, position);
    });
  }
}
