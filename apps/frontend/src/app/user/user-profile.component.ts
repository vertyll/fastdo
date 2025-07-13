import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { heroUserCircle } from '@ng-icons/heroicons/outline';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PlatformService } from 'src/app/shared/services/platform.service';
import { PasswordValidator } from '../auth/validators/password.validator';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { SpinnerComponent } from '../shared/components/atoms/spinner.component';
import { ImageComponent } from '../shared/components/organisms/image.component';
import { ToastService } from '../shared/services/toast.service';
import { LOADING_STATE_VALUE } from '../shared/types/list-state.type';
import { UserService } from './data-access/user.service';
import { UserStateService } from './data-access/user.state.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    SpinnerComponent,
    ErrorMessageComponent,
    DatePipe,
    CommonModule,
    ImageComponent,
  ],
  providers: [provideIcons({ heroUserCircle })],
  template: `
    @switch (stateService.state()) {
      @case (LOADING_STATE_VALUE.LOADING) {
        <div class="flex justify-center items-center h-48">
          <app-spinner />
        </div>
      }
      @case (LOADING_STATE_VALUE.SUCCESS) {
        <div class="max-w-4xl mx-auto p-spacing-6">
          <div class="bg-background-primary dark:bg-dark-background-primary shadow-boxShadow-md rounded-borderRadius-lg overflow-hidden">
            @if (!isEditing) {
              <div class="p-spacing-6">
                <div class="flex justify-between items-center mb-spacing-6">
                  <h2 class="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                    {{ 'Profile.myProfile' | translate }}
                  </h2>
                  <button
                    class="bg-primary-500 text-white px-spacing-4 py-spacing-2 rounded-borderRadius-md hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 transition-colors duration-transitionDuration-200"
                    (click)="toggleEdit()"
                  >
                    {{ 'Profile.edit' | translate }}
                  </button>
                </div>

                <div
                  [ngClass]="{ 'profile-info': !isMobile(), 'profile-info-mobile': isMobile() }">
                  <app-image
                    [initialUrl]="user().avatar?.url || null"
                    mode="preview"
                    size="md"
                    format="circle"
                  />
                  <div class="profile-details">
                    <div class="text-xl font-medium text-text-primary dark:text-dark-text-primary">
                      {{ user().email }}
                    </div>
                    <div class="text-sm text-text-secondary dark:text-dark-text-secondary">
                      {{ 'Profile.memberSince' | translate }}
                      {{ user().dateCreation | date:'mediumDate' }}
                    </div>
                  </div>
                </div>
              </div>
            } @else {
              <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="p-spacing-6 space-y-spacing-6">
                <div class="flex justify-between items-center mb-spacing-6">
                  <h2 class="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                    {{ 'Basic.edit' | translate }}
                  </h2>
                  <div class="flex justify-end space-x-spacing-4">
                    <button
                      type="button"
                      class="px-spacing-4 py-spacing-2 border border-border-primary dark:border-dark-border-primary rounded-borderRadius-md text-text-primary dark:text-dark-text-primary hover:bg-background-secondary dark:hover:bg-dark-background-secondary"
                      (click)="toggleEdit()"
                    >
                      {{ 'Basic.cancel' | translate }}
                    </button>
                    <button
                      type="submit"
                      class="bg-primary-500 text-white px-spacing-4 py-spacing-2 rounded-borderRadius-md hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
                      [disabled]="!profileForm.valid || stateService.state() === LOADING_STATE_VALUE.LOADING"
                    >
                      {{ 'Basic.save' | translate }}
                    </button>
                  </div>
                </div>

                <div class="mb-spacing-6 flex items-center">
                  <app-image
                    [initialUrl]="user().avatar?.url || null"
                    mode="edit"
                    size="md"
                    format="circle"
                    (imageSaved)="onImageSaved($event)"
                    (croppingChange)="onCroppingChange($event)"
                    (imageRemoved)="onImageRemoved()"
                  />
                </div>

                <div class="space-y-spacing-4">
                  <div>
                    <label class="block text-sm font-medium text-text-primary dark:text-dark-text-primary" for="email">
                      {{ 'Profile.email' | translate }}
                    </label>
                    <input
                      id="email"
                      type="email"
                      formControlName="email"
                      class="mt-1 block w-full px-spacing-3 py-spacing-2 bg-background-primary dark:bg-dark-background-primary border border-border-primary dark:border-dark-border-primary rounded-borderRadius-md shadow-boxShadow-sm focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 focus:border-transparent transition-colors duration-transitionDuration-200 text-text-primary dark:text-dark-text-primary"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-text-primary dark:text-dark-text-primary" for="password">
                      {{ 'Profile.password' | translate }}
                    </label>
                    <input
                      id="password"
                      type="password"
                      formControlName="password"
                      class="mt-1 block w-full px-spacing-3 py-spacing-2 bg-background-primary dark:bg-dark-background-primary border border-border-primary dark:border-dark-border-primary rounded-borderRadius-md shadow-boxShadow-sm focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 focus:border-transparent transition-colors duration-transitionDuration-200 text-text-primary dark:text-dark-text-primary"
                    />
                    @if (passwordErrors.length > 0) {
                      @for (error of passwordErrors; track error) {
                        <app-error-message [customMessage]="error" />
                      }
                    }
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-text-primary dark:text-dark-text-primary" for="newPassword">
                      {{ 'Profile.newPassword' | translate }}
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      formControlName="newPassword"
                      class="mt-1 block w-full px-spacing-3 py-spacing-2 bg-background-primary dark:bg-dark-background-primary border border-border-primary dark:border-dark-border-primary rounded-borderRadius-md shadow-boxShadow-sm focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 focus:border-transparent transition-colors duration-transitionDuration-200 text-text-primary dark:text-dark-text-primary"
                    />
                    @if (newPasswordErrors.length > 0) {
                      @for (error of newPasswordErrors; track error) {
                        <app-error-message [customMessage]="error" />
                      }
                    }
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-text-primary dark:text-dark-text-primary" for="confirmNewPassword">
                      {{ 'Profile.confirmNewPassword' | translate }}
                    </label>
                    <input
                      id="confirmNewPassword"
                      type="password"
                      formControlName="confirmNewPassword"
                      class="mt-1 block w-full px-spacing-3 py-spacing-2 bg-background-primary dark:bg-dark-background-primary border border-border-primary dark:border-dark-border-primary rounded-borderRadius-md shadow-boxShadow-sm focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 focus:border-transparent transition-colors duration-transitionDuration-200 text-text-primary dark:text-dark-text-primary"
                    />
                    @if (confirmNewPasswordErrors.length > 0) {
                      @for (error of confirmNewPasswordErrors; track error) {
                        <app-error-message [customMessage]="error" />
                      }
                    }

                    @if (LOADING_STATE_VALUE.ERROR) {
                      <app-error-message [customMessage]="stateService.error()?.message" />
                    }
                  </div>
                </div>
              </form>
            }
          </div>
        </div>
      }
    }
  `,
  styles: [`
    .profile-info {
      display: flex;
      align-items: center;
    }
    .profile-info-mobile {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .profile-details {
      margin-left: 1rem;
    }
    @media (max-width: 640px) {
      .profile-details {
        margin-left: 0;
        margin-top: 1rem;
      }
    }
  `],
})
export class UserProfileComponent implements OnInit {
  private readonly userService = inject(UserService);
  protected readonly stateService = inject(UserStateService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly passwordValidator = inject(PasswordValidator);
  private readonly translateService = inject(TranslateService);
  private readonly platformService = inject(PlatformService);

  protected readonly LOADING_STATE_VALUE = LOADING_STATE_VALUE;
  protected readonly user = computed(() => this.stateService.user());
  protected isEditing = false;
  protected selectedFile: File | null = null;
  protected avatarRemoved: boolean = false;
  protected profileForm: FormGroup;

  protected passwordErrors: string[] = [];
  protected newPasswordErrors: string[] = [];
  protected confirmNewPasswordErrors: string[] = [];
  protected isCropping: boolean = false;

  constructor() {
    this.profileForm = this.fb.group({
      email: ['', [Validators.email]],
      password: ['', [this.passwordValidator.validatePassword]],
      newPassword: [null, [this.passwordValidator.validatePassword]],
      confirmNewPassword: [null],
    });

    this.profileForm.valueChanges.subscribe(() => {
      this.passwordErrors = this.getPasswordErrors('password');
      this.newPasswordErrors = this.getPasswordErrors('newPassword');
      this.confirmNewPasswordErrors = this.getConfirmNewPasswordErrors();
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.userService.getCurrentUser().subscribe();
  }

  protected toggleEdit(): void {
    if (!this.isEditing) {
      this.profileForm.patchValue({
        email: this.user().email,
      });
    }
    this.isEditing = !this.isEditing;
  }

  protected onImageSaved(event: { file: File; preview: string | null; }): void {
    this.selectedFile = event.file;
    this.avatarRemoved = false;
  }

  protected onCroppingChange(isCropping: boolean): void {
    this.isCropping = isCropping;
  }

  protected onImageRemoved(): void {
    this.selectedFile = null;
    this.avatarRemoved = true;
  }

  protected onSubmit(): void {
    if (this.isCropping || !this.profileForm.valid) {
      return;
    }
    if (this.profileForm.valid) {
      const formData = new FormData();
      let hasChanges = false;

      if (this.profileForm.get('email')?.dirty && this.profileForm.get('email')?.value !== this.user()?.email) {
        formData.append('email', this.profileForm.get('email')?.value);
        hasChanges = true;
      }

      if (this.profileForm.get('password')?.value) {
        formData.append('password', this.profileForm.get('password')?.value);
        hasChanges = true;
      }

      if (this.profileForm.get('newPassword')?.dirty) {
        formData.append('newPassword', this.profileForm.get('newPassword')?.value);
        hasChanges = true;
      }

      const hadAvatar = !!this.user()?.avatar;
      if (this.selectedFile) {
        formData.append('avatar', this.selectedFile);
        hasChanges = true;
      } else if (hadAvatar && this.avatarRemoved) {
        formData.append('avatar', 'null');
        hasChanges = true;
      }

      if (hasChanges) {
        this.userService.updateProfile(formData).subscribe({
          next: () => {
            this.isEditing = false;
            this.selectedFile = null;
            this.profileForm.reset();
            this.toastService.presentToast(this.translateService.instant('Profile.updateSuccess'), true);
          },
          error: err => {
            this.toastService.presentToast(err.error.message || this.translateService.instant('Profile.updateError'));
          },
        });
      } else {
        this.isEditing = false;
      }
    }
  }

  private getPasswordErrors(controlName: string): string[] {
    const control = this.profileForm.get(controlName);
    const errors: string[] = [];
    if (control?.hasError('minlength')) {
      errors.push(this.translateService.instant('Auth.passwordMinLength'));
    }
    if (control?.hasError('uppercase')) {
      errors.push(this.translateService.instant('Auth.passwordUppercase'));
    }
    if (control?.hasError('specialCharacter')) {
      errors.push(this.translateService.instant('Auth.passwordSpecialCharacter'));
    }
    return errors;
  }

  private getConfirmNewPasswordErrors(): string[] {
    const newPassword = this.profileForm.get('newPassword')?.value;
    const confirmNewPassword = this.profileForm.get('confirmNewPassword')?.value;
    const errors: string[] = [];
    if (newPassword !== confirmNewPassword) {
      errors.push(this.translateService.instant('Auth.passwordDoNotMatch'));
    }
    return errors;
  }

  protected isMobile(): boolean {
    return this.platformService.isMobile();
  }
}
