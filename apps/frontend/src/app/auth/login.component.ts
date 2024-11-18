import { Component } from '@angular/core';
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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    ErrorMessageComponent,
    LinkComponent,
  ],
  template: `
    <div
      class="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-md mt-10"
    >
      <h2 class="text-2xl font-bold mb-4">{{ 'Auth.login' | translate }}</h2>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <label for="email" class="block mb-2"
          >{{ 'Auth.email' | translate }}:</label
        >
        <input
          id="email"
          formControlName="email"
          required
          class="input-field mb-4 p-2 border border-gray-300 rounded w-full"
        />
        <label for="password" class="block mb-2"
          >{{ 'Auth.password' | translate }}:</label
        >
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
  styles: [],
})
export class LoginComponent {
  protected readonly loginForm: FormGroup;
  protected readonly LinkType = LinkType;
  protected errorMessage: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    protected readonly router: Router,
    private readonly translateService: TranslateService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  protected onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.router.navigate(['/tasks']);
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
