import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { LabelComponent } from '../shared/components/atoms/label.component';
import { LinkComponent } from '../shared/components/atoms/link.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { LinkTypeEnum } from '../shared/enums/link-type.enum';
import { ToastPositionEnum } from '../shared/enums/toast-position.enum';
import { ToastService } from '../shared/services/toast.service';
import { AuthService } from './data-access/auth.service';
import { EmailChangeService } from './data-access/email-change.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, TranslateModule, ErrorMessageComponent, LinkComponent, TitleComponent, LabelComponent],
  template: `
    <div
      class="max-w-md mx-auto p-6 border border-border-primary dark:border-dark-border-primary rounded-lg shadow-md mt-10 bg-background-primary dark:bg-dark-background-primary"
    >
      <app-title [text]="'Auth.login' | translate"></app-title>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <app-label forId="email">{{ 'Auth.email' | translate }}: </app-label>
        <input
          id="email"
          formControlName="email"
          required
          class="input-field bg-background-secondary dark:bg-dark-background-secondary dark:text-dark-text-primary block w-full h-12 px-2 py-4 text-sm transition-colors duration-200 text-text-primary rounded-lg border border-border-primary dark:border-dark-border-primary appearance-none focus:outline-none focus:ring-0 focus:border-primary-600 dark:focus:border-primary-500 peer"
        />
        <app-label forId="password">{{ 'Auth.password' | translate }}: </app-label>
        <input
          id="password"
          type="password"
          formControlName="password"
          required
          class="input-field bg-background-secondary dark:bg-dark-background-secondary dark:text-dark-text-primary block w-full h-12 px-2 py-4 text-sm transition-colors duration-200 text-text-primary rounded-lg border border-border-primary dark:border-dark-border-primary appearance-none focus:outline-none focus:ring-0 focus:border-primary-600 dark:focus:border-primary-500 peer"
        />
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

  protected readonly loginForm: FormGroup;
  protected readonly LinkTypeEnum = LinkTypeEnum;
  protected errorMessage: string | null = null;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.loginForm.patchValue({ email: params['email'] });
      }

      if (params['confirmed'] === 'true') {
        this.translateService.get('Auth.emailConfirmed').subscribe((message: string): void => {
          this.toastService.presentToast(message, true, ToastPositionEnum.Relative);
        });
      }

      if (params['error'] === 'invalid_email_token') {
        this.translateService.get('Auth.invalidEmailToken').subscribe((message: string): void => {
          this.toastService.presentToast(message, false, ToastPositionEnum.Relative);
        });
      }

      if (params['emailChanged'] === 'true') {
        this.emailChangeService.handleEmailChange(true);
        this.translateService
          .get('Auth.emailChanged')
          .subscribe(message => this.toastService.presentToast(message, true));
      }

      if (params['error'] === 'invalid_email_change_token') {
        this.translateService.get('Auth.invalidEmailChangeToken').subscribe((message: string): void => {
          this.toastService.presentToast(message, false, ToastPositionEnum.Relative);
        });
      }
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
}
