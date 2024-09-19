import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../data-access/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div
      class="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-md mt-10"
    >
      <h2 class="text-2xl font-bold mb-4">Register</h2>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
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
        <label for="confirmPassword" class="block mb-2"
          >Confirm Password:</label
        >
        <input
          id="confirmPassword"
          type="password"
          formControlName="confirmPassword"
          required
          class="input-field mb-4 p-2 border border-gray-300 rounded w-full"
        />
        @if (passwordMismatch) {
          <div class="text-red-500 mb-2">Passwords do not match.</div>
        }
        @if (errorMessage) {
          <div class="text-red-500 mb-2">{{ errorMessage }}</div>
        }
        <button
          type="submit"
          class="submit-button w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Register
        </button>
        <button
          type="button"
          (click)="router.navigate(['/login'])"
          class="mt-4 text-blue-500 hover:underline"
        >
          Already have an account? Login here.
        </button>
      </form>
    </div>
  `,
  styles: [],
})
export class RegisterComponent implements OnInit {
  protected registerForm: FormGroup;
  protected passwordMismatch: boolean = false;
  protected errorMessage: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    protected readonly router: Router,
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  ngOnInit(): void{
    this.registerForm.valueChanges.subscribe(() => {
      this.checkPasswords();
      this.errorMessage = null;
    });
  }

  checkPasswords(): void {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    this.passwordMismatch = password !== confirmPassword;
  }

  onSubmit(): void {
    this.checkPasswords();

    if (this.registerForm.valid && !this.passwordMismatch) {
      const { email, password } = this.registerForm.value;
      this.authService.register({ email, password }).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'An error occurred during registration.';
          }
        },
      });
    }
  }
}
