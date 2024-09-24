import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../data-access/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { NotificationType } from 'src/app/shared/enums/notification.enum';
import { passwordValidator } from '../validators/password.validator';

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
        @if (emailErrors.length > 0) {
          <div class="text-red-500 mb-2">
            @for (error of emailErrors; track error) {
              <div>{{ error }}</div>
            }
          </div>
        }
        @if (passwordMismatch) {
          <div class="text-red-500 mb-2">Passwords do not match.</div>
        }
        @if (passwordErrors.length > 0) {
          <div class="text-red-500 mb-2">
            @for (error of passwordErrors; track error) {
              <div>{{ error }}</div>
            }
          </div>
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
  protected passwordErrors: string[] = [];
  protected emailErrors: string[] = [];
  protected errorMessage: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    protected readonly router: Router,
    protected readonly notificationService: NotificationService,
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordValidator]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.registerForm.valueChanges.subscribe(() => {
      this.checkPasswords();
      this.errorMessage = null;
      this.passwordErrors = this.getPasswordErrors();
      this.emailErrors = this.getEmailErrors();
    });
  }

  checkPasswords(): void {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    this.passwordMismatch = password !== confirmPassword;
  }

  getPasswordErrors(): string[] {
    const passwordControl = this.registerForm.get('password');
    const errors: string[] = [];
    if (passwordControl?.hasError('required')) {
      errors.push('Password is required.');
    }
    if (passwordControl?.hasError('minlength')) {
      errors.push('Password must be at least 8 characters long.');
    }
    if (passwordControl?.hasError('uppercase')) {
      errors.push('Password must contain at least one uppercase letter.');
    }
    if (passwordControl?.hasError('specialCharacter')) {
      errors.push('Password must contain at least one special character.');
    }
    return errors;
  }

  getEmailErrors(): string[] {
    const emailControl = this.registerForm.get('email');
    const errors: string[] = [];
    if (emailControl?.hasError('required')) {
      errors.push('Email is required.');
    }
    if (emailControl?.hasError('email')) {
      errors.push('Email must be a valid email address.');
    }
    return errors;
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
        complete: () => {
          this.notificationService.showNotification(
            'Registration successful. Please log in.',
            NotificationType.success,
          );
        },
      });
    }
  }
}
