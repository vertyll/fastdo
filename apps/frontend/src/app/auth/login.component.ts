import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './data-access/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div
      class="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-md mt-10"
    >
      <h2 class="text-2xl font-bold mb-4">Login</h2>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <label for="email" class="block mb-2">Email:</label>
        <input
          id="email"
          formControlName="email"
          required
          class="input-field mb-4 p-2 border border-gray-300 rounded w-full"
        />
        <label for="password" class="block mb-2">Password:</label>
        <input
          id="password"
          type="password"
          formControlName="password"
          required
          class="input-field mb-4 p-2 border border-gray-300 rounded w-full"
        />
        @if (errorMessage) {
          <div class="text-red-500 mb-2">{{ errorMessage }}</div>
        }
        <button
          type="submit"
          class="submit-button w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Login
        </button>
        <button
          type="button"
          (click)="router.navigate(['/register'])"
          class="mt-4 text-blue-500 hover:underline"
        >
          Don't have an account? Register here.
        </button>
      </form>
    </div>
  `,
  styles: [],
})
export class LoginComponent {
  protected readonly loginForm: FormGroup;
  protected errorMessage: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    protected readonly router: Router,
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
            this.errorMessage = 'An error occurred during login.';
          }
        },
      });
    }
  }
}
