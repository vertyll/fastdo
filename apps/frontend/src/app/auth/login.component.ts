import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './data-access/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { LinkComponent } from '../shared/components/atoms/link.component';
import { LinkType } from '../shared/enums/link.enum';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { LabelComponent } from '../shared/components/atoms/label.component';

@Component({
    selector: 'app-login',
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
      <app-title>{{ 'Auth.login' | translate }}</app-title>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <app-label forId="email">{{ 'Auth.email' | translate }}: </app-label>
        <input
          id="email"
          formControlName="email"
          required
          class="input-field mb-4 p-2 border border-gray-300 rounded w-full"
        />
        <app-label forId="password"
          >{{ 'Auth.password' | translate }}:
        </app-label>
        <input
          id="password"
          type="password"
          formControlName="password"
          required
          class="input-field mb-4 p-2 border border-gray-300 rounded w-full"
        />
        @if (errorMessage) {
          <app-error-message [customMessage]="errorMessage" />
        }
        <button
          type="submit"
          class="submit-button w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          {{ 'Auth.loginButton' | translate }}
        </button>
        <app-link
          class="mt-4 block"
          [routerLink]="['/register']"
          [linkType]="LinkType.Default"
          >{{ 'Auth.dontHaveAccount' | translate }}</app-link
        >
      </form>
    </div>
  `,
    styles: []
})
export class LoginComponent {
  protected readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly translateService = inject(TranslateService);

  protected readonly loginForm: FormGroup;
  protected readonly LinkType = LinkType;
  protected errorMessage: string | null = null;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  protected onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/tasks']).then();
        },
        error: (err) => {
          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = this.translateService.instant(
              'Auth.unknownLoginError',
            );
          }
        },
      });
    }
  }
}
