import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { heroUserCircle } from '@ng-icons/heroicons/outline';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PlatformService } from 'src/app/shared/services/platform.service';
import { PasswordValidator } from '../auth/validators/password.validator';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { SpinnerComponent } from '../shared/components/atoms/spinner.component';
import { ImageComponent } from '../shared/components/organisms/image.component';
import { CustomDatePipe } from '../shared/pipes/custom-date.pipe';
import { ToastService } from '../shared/services/toast.service';
import { LOADING_STATE_VALUE } from '../shared/defs/list-state.defs';
import { UserService } from './data-access/user.service';
import { UserStateService } from './data-access/user.state.service';
import { InputFieldComponent } from '../shared/components/molecules/input-field.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    SpinnerComponent,
    ErrorMessageComponent,
    CustomDatePipe,
    CommonModule,
    ImageComponent,
    InputFieldComponent,
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
        <div class="max-w-4xl mx-auto">
          <div
            class="bg-background-primary dark:bg-dark-background-primary shadow-md rounded-lg overflow-hidden dark:border-dark-border-primary border-border-primary border"
          >
            @if (!isEditing) {
              <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                    {{ 'Profile.myProfile' | translate }}
                  </h2>
                  <button
                    class="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 transition-colors duration-200"
                    (click)="toggleEdit()"
                  >
                    {{ 'Profile.edit' | translate }}
                  </button>
                </div>

                <div [ngClass]="{ 'profile-info': !isMobile(), 'profile-info-mobile': isMobile() }">
                  <app-image [initialUrl]="user().avatar?.url || null" mode="preview" size="md" format="circle" />
                  <div class="profile-details">
                    <div class="text-xl font-medium text-text-primary dark:text-dark-text-primary">
                      {{ user().email }}
                    </div>
                    <div class="text-sm text-text-secondary dark:text-dark-text-secondary">
                      {{ 'Profile.memberSince' | translate }}
                      {{ user().dateCreation | customDate }}
                    </div>
                  </div>
                </div>
              </div>
            } @else {
              <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="p-6 space-y-6">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                    {{ 'Basic.edit' | translate }}
                  </h2>
                  <div class="flex justify-end space-x-4">
                    <button
                      type="button"
                      class="px-4 py-2 border border-border-primary dark:border-dark-border-primary rounded-md text-text-primary dark:text-dark-text-primary hover:bg-background-secondary dark:hover:bg-dark-background-secondary"
                      (click)="toggleEdit()"
                    >
                      {{ 'Basic.cancel' | translate }}
                    </button>
                    <button
                      type="submit"
                      class="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
                      [disabled]="!profileForm.valid || stateService.state() === LOADING_STATE_VALUE.LOADING"
                    >
                      {{ 'Basic.save' | translate }}
                    </button>
                  </div>
                </div>

                <div class="mb-6 flex items-center">
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

                <div class="space-y-4">
                  <div>
                    <app-input-field
                      [id]="'email'"
                      [type]="'email'"
                      [control]="getFormControl('email')"
                      [label]="'Profile.email' | translate"
                      [errorMessage]="getEmailErrorMessage()"
                    />
                  </div>

                  <div>
                    <app-input-field
                      [id]="'password'"
                      [type]="'password'"
                      [control]="getFormControl('password')"
                      [label]="'Profile.password' | translate"
                      [errorMessage]="getPasswordErrorMessage('password')"
                    />
                  </div>

                  <div>
                    <app-input-field
                      [id]="'newPassword'"
                      [type]="'password'"
                      [control]="getFormControl('newPassword')"
                      [label]="'Profile.newPassword' | translate"
                      [errorMessage]="getPasswordErrorMessage('newPassword')"
                    />
                  </div>

                  <div>
                    <app-input-field
                      [id]="'confirmNewPassword'"
                      [type]="'password'"
                      [control]="getFormControl('confirmNewPassword')"
                      [label]="'Profile.confirmNewPassword' | translate"
                      [errorMessage]="getConfirmNewPasswordErrorMessage()"
                    />

                    @if (stateService.error()) {
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
  styles: [
    `
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
    `,
  ],
})
export class UserProfileComponent implements OnInit {
  private readonly userService = inject(UserService);
  protected readonly stateService = inject(UserStateService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly passwordValidator = inject(PasswordValidator);
  private readonly translateService = inject(TranslateService);
  private readonly platformService = inject(PlatformService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly LOADING_STATE_VALUE = LOADING_STATE_VALUE;
  protected readonly user = computed(() => this.stateService.user());
  protected readonly isMobile = this.platformService.isMobile;

  protected isEditing = false;
  protected selectedFile: File | null = null;
  protected avatarRemoved: boolean = false;
  protected profileForm!: FormGroup;
  protected passwordErrors: string[] = [];
  protected newPasswordErrors: string[] = [];
  protected confirmNewPasswordErrors: string[] = [];
  protected isCropping: boolean = false;

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserProfile();

    this.profileForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.updateFormErrors();
    });
  }

  protected toggleEdit(): void {
    if (!this.isEditing) {
      this.profileForm.patchValue({
        email: this.user().email,
      });
    }
    this.isEditing = !this.isEditing;
  }

  protected onImageSaved(event: { file: File; preview: string | null }): void {
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

    const formData = new FormData();
    let hasChanges = false;

    const emailControl = this.profileForm.get('email');
    if (emailControl?.dirty && emailControl.value !== this.user()?.email) {
      formData.append('email', emailControl.value);
      hasChanges = true;
    }

    const passwordControl = this.profileForm.get('password');
    if (passwordControl?.value) {
      formData.append('password', passwordControl.value);
      hasChanges = true;
    }

    const newPasswordControl = this.profileForm.get('newPassword');
    if (newPasswordControl?.dirty) {
      formData.append('newPassword', newPasswordControl.value);
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

  protected getFormControl(name: string): FormControl {
    return this.profileForm.get(name) as FormControl;
  }

  protected getEmailErrorMessage(): string {
    const control = this.profileForm?.get('email');
    if (!control || !control.touched) return '';
    if (control.hasError('required')) return this.translateService.instant('Auth.emailRequired');
    if (control.hasError('email')) return this.translateService.instant('Auth.emailInvalid');
    return '';
  }

  protected getPasswordErrorMessage(controlName: string): string {
    const control = this.profileForm?.get(controlName);
    if (!control || !control.touched) return '';
    if (control.hasError('required')) return this.translateService.instant('Auth.passwordRequired');
    if (control.hasError('minlength')) return this.translateService.instant('Auth.passwordMinLength');
    if (control.hasError('uppercase')) return this.translateService.instant('Auth.passwordUppercase');
    if (control.hasError('specialCharacter')) return this.translateService.instant('Auth.passwordSpecialCharacter');
    return '';
  }

  protected getConfirmNewPasswordErrorMessage(): string {
    const control = this.profileForm?.get('confirmNewPassword');
    if (!control || !control.touched) return '';
    const newPassword = this.profileForm.get('newPassword')?.value;
    const confirmNewPassword = control.value;
    if (newPassword && newPassword !== confirmNewPassword) {
      return this.translateService.instant('Auth.passwordDoNotMatch');
    }
    return '';
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      email: ['', [Validators.email, Validators.required]],
      password: ['', [this.passwordValidator.validatePassword]],
      newPassword: [null, [this.passwordValidator.validatePassword]],
      confirmNewPassword: [null],
    });
  }

  private updateFormErrors(): void {
    this.passwordErrors = this.getPasswordErrors('password');
    this.newPasswordErrors = this.getPasswordErrors('newPassword');
    this.confirmNewPasswordErrors = this.getConfirmNewPasswordErrors();
  }

  private loadUserProfile(): void {
    this.userService.getCurrentUser().subscribe();
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
}
