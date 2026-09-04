import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { heroUserCircle } from '@ng-icons/heroicons/outline';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../auth/data-access/auth.service';
import { FileUploadService } from '../file/data-access/file-upload.service';
import { FileScopeEnum } from '../file/defs/file.defs';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { SpinnerComponent } from '../shared/components/atoms/spinner.component';
import { InputFieldComponent } from '../shared/components/molecules/input-field.component';
import { ImageComponent } from '../shared/components/organisms/image.component';
import { LOADING_STATE_VALUE } from '../shared/defs/list-state.defs';
import { CustomDatePipe } from '../shared/pipes/custom-date.pipe';
import { ToastService } from '../shared/services/toast.service';
import { UserService } from './data-access/user.service';
import { UserStateService } from './data-access/user.state.service';

@Component({
  selector: 'app-user-profile',
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    SpinnerComponent,
    ErrorMessageComponent,
    CustomDatePipe,
    ImageComponent,
    InputFieldComponent,
    ButtonComponent,
  ],
  providers: [provideIcons({ heroUserCircle })],
  template: `
    @switch (stateService.state()) {
      @case (LOADING_STATE_VALUE.LOADING) {
        <div class="flex justify-center items-center h-48">
          <app-spinner />
        </div>
      }
      @case (LOADING_STATE_VALUE.ERROR) {
        <app-error-message [messageKey]="$safeNavigationMigration(stateService.error()?.code)" />
      }
      @case (LOADING_STATE_VALUE.SUCCESS) {
        @if (user(); as profile) {
          <div class="max-w-4xl mx-auto space-y-6">
            <div
              class="bg-background-primary dark:bg-dark-background-primary shadow-md rounded-lg p-6 border border-border-primary dark:border-dark-border-primary"
            >
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                  {{ 'Profile.myProfile' | translate }}
                </h2>
                @if (!isEditing()) {
                  <app-button (click)="toggleEdit()">{{ 'Profile.edit' | translate }}</app-button>
                }
              </div>

              @if (!isEditing()) {
                <div class="flex flex-col sm:flex-row gap-6">
                  <app-image [fileId]="avatarUrl()" mode="preview" size="md" format="circle" />
                  <dl class="space-y-2">
                    <dt class="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      {{ 'Profile.name' | translate }}
                    </dt>
                    <dd class="font-medium">{{ profile.firstName }} {{ profile.lastName }}</dd>

                    <dt class="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      {{ 'Auth.email' | translate }}
                    </dt>
                    <dd class="font-medium">{{ profile.email }}</dd>

                    @if (profile.phoneNumber) {
                      <dt class="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {{ 'Profile.phoneNumber' | translate }}
                      </dt>
                      <dd class="font-medium">{{ profile.phoneNumber }}</dd>
                    }

                    @if (profile.address) {
                      <dt class="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {{ 'Profile.address' | translate }}
                      </dt>
                      <dd class="font-medium">{{ profile.address }}</dd>
                    }

                    @if (profile.createdAt) {
                      <dt class="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {{ 'Profile.memberSince' | translate }}
                      </dt>
                      <dd class="font-medium">{{ profile.createdAt | customDate }}</dd>
                    }
                  </dl>
                </div>
              } @else {
                <form [formGroup]="profileForm" (ngSubmit)="save()" class="space-y-4">
                  <app-image
                    [fileId]="avatarUrl()"
                    mode="edit"
                    size="md"
                    format="circle"
                    (imageSaved)="onAvatarSelected($event.file)"
                    (imageRemoved)="onAvatarRemoved()"
                  />

                  <app-input-field
                    id="firstName"
                    [control]="controlOf('firstName')"
                    [label]="'Profile.firstName' | translate"
                  />
                  <app-input-field
                    id="lastName"
                    [control]="controlOf('lastName')"
                    [label]="'Profile.lastName' | translate"
                  />
                  <app-input-field
                    id="phoneNumber"
                    [control]="controlOf('phoneNumber')"
                    [label]="'Profile.phoneNumber' | translate"
                  />
                  <app-input-field
                    id="address"
                    [control]="controlOf('address')"
                    [label]="'Profile.address' | translate"
                  />

                  <div class="flex gap-2">
                    <app-button type="submit" [disabled]="profileForm.invalid || saving()">
                      {{ 'Basic.save' | translate }}
                    </app-button>
                    <app-button type="button" (click)="cancelEdit()">{{ 'Basic.cancel' | translate }}</app-button>
                  </div>
                </form>
              }
            </div>

            <div
              class="bg-background-primary dark:bg-dark-background-primary shadow-md rounded-lg p-6 border border-border-primary dark:border-dark-border-primary"
            >
              <h3 class="text-lg font-semibold mb-2">{{ 'Profile.security' | translate }}</h3>
              <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
                {{ 'Auth.signInHint' | translate }}
              </p>
              <div class="flex flex-wrap gap-2">
                <app-button (click)="changePassword()">{{ 'Auth.managePassword' | translate }}</app-button>
                <app-button (click)="configureTwoFactor()">{{ 'Auth.manageTwoFactor' | translate }}</app-button>
              </div>
            </div>
          </div>
        }
      }
    }
  `,
})
export class UserProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly fileUploadService = inject(FileUploadService);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);

  protected readonly stateService = inject(UserStateService);
  protected readonly LOADING_STATE_VALUE = LOADING_STATE_VALUE;

  protected readonly user = this.stateService.user;
  protected readonly isEditing = signal(false);
  protected readonly saving = signal(false);

  private readonly pendingAvatarFileId = signal<string | null | undefined>(undefined);

  protected readonly avatarUrl = computed(() => {
    return this.user()?.avatarFileId ?? null;
  });

  protected controlOf(name: string): FormControl {
    return this.profileForm.get(name) as FormControl;
  }

  protected profileForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: [''],
    address: [''],
  });

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(() => this.resetForm());
  }

  protected toggleEdit(): void {
    this.resetForm();
    this.isEditing.set(true);
  }

  protected cancelEdit(): void {
    this.pendingAvatarFileId.set(undefined);
    this.isEditing.set(false);
  }

  protected changePassword(): void {
    this.authService.startAccountAction('UPDATE_PASSWORD');
  }

  protected configureTwoFactor(): void {
    this.authService.startAccountAction('CONFIGURE_TOTP');
  }

  protected onAvatarSelected(file: File): void {
    this.saving.set(true);
    this.fileUploadService.upload(file, FileScopeEnum.USER_AVATAR).subscribe({
      next: stored => {
        this.pendingAvatarFileId.set(stored.id);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  protected onAvatarRemoved(): void {
    this.pendingAvatarFileId.set(null);
  }

  protected save(): void {
    if (this.profileForm.invalid) {
      return;
    }

    const pending = this.pendingAvatarFileId();
    this.saving.set(true);
    this.userService
      .updateProfile({
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName,
        phoneNumber: this.profileForm.value.phoneNumber || null,
        address: this.profileForm.value.address || null,
        ...(pending === undefined ? {} : { avatarFileId: pending }),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.isEditing.set(false);
          this.pendingAvatarFileId.set(undefined);
          this.toastService.presentToast(this.translateService.instant('Profile.updateSuccess'), true);
        },
        error: () => this.saving.set(false),
      });
  }

  private resetForm(): void {
    const profile = this.user();
    if (!profile) {
      return;
    }
    this.profileForm.patchValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.phoneNumber ?? '',
      address: profile.address ?? '',
    });
    this.pendingAvatarFileId.set(undefined);
  }
}
