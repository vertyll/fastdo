import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, catchError, finalize, of, takeUntil } from 'rxjs';
import { NotificationTypeEnum } from '../../enums/notification.enum';
import { NotificationStateService } from '../../services/notification-state.service';
import { NotificationService } from '../../services/notification.service';
import { UpdateNotificationSettingsDto } from '../../types/notification.type';
import { ButtonComponent } from '../atoms/button.component';
import { CheckboxComponent } from '../atoms/checkbox.component';
import { TitleComponent } from '../atoms/title.component';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    TitleComponent,
    ButtonComponent,
    CheckboxComponent,
  ],
  template: `
    <div class="max-w-2xl mx-auto p-6">
      <app-title>{{ 'Notifications.settings' | translate }}</app-title>

      <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()" class="space-y-6 mt-6">
        <div class="space-y-4">
          <!-- App Notifications -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {{ 'Notifications.appNotifications' | translate }}
              </label>
            </div>
            <app-checkbox
              [control]="getControl('appNotifications')"
              [id]="'appNotifications'"
            />
          </div>

          <!-- Email Notifications -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {{ 'Notifications.emailNotifications' | translate }}
              </label>
            </div>
            <app-checkbox
              [control]="getControl('emailNotifications')"
              [id]="'emailNotifications'"
            />
          </div>

          <!-- Project Invitations -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {{ 'Notifications.projectInvitations' | translate }}
              </label>
            </div>
            <app-checkbox
              [control]="getControl('projectInvitations')"
              [id]="'projectInvitations'"
            />
          </div>

          <!-- Task Assignments -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {{ 'Notifications.taskAssignments' | translate }}
              </label>
            </div>
            <app-checkbox
              [control]="getControl('taskAssignments')"
              [id]="'taskAssignments'"
            />
          </div>

          <!-- Task Comments -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {{ 'Notifications.taskComments' | translate }}
              </label>
            </div>
            <app-checkbox
              [control]="getControl('taskComments')"
              [id]="'taskComments'"
            />
          </div>

          <!-- Task Status Changes -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {{ 'Notifications.taskStatusChanges' | translate }}
              </label>
            </div>
            <app-checkbox
              [control]="getControl('taskStatusChanges')"
              [id]="'taskStatusChanges'"
            />
          </div>

          <!-- Project Updates -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {{ 'Notifications.projectUpdates' | translate }}
              </label>
            </div>
            <app-checkbox
              [control]="getControl('projectUpdates')"
              [id]="'projectUpdates'"
            />
          </div>

          <!-- System Notifications -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {{ 'Notifications.systemNotifications' | translate }}
              </label>
            </div>
            <app-checkbox
              [control]="getControl('systemNotifications')"
              [id]="'systemNotifications'"
            />
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-4 pt-6">
          <app-button
            type="submit"
            [disabled]="settingsForm.invalid || isSubmitting"
          >
            {{ isSubmitting ? ('Basic.saving' | translate) : ('Basic.save' | translate) }}
          </app-button>
        </div>
      </form>
    </div>
  `,
})
export class NotificationSettingsComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly notificationStateService = inject(NotificationStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  protected settingsForm!: FormGroup;
  protected isSubmitting: boolean = false;

  ngOnInit(): void {
    this.initializeForm();
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected getControl(name: string): FormControl {
    return this.settingsForm.get(name) as FormControl;
  }

  protected onSubmit(): void {
    if (this.settingsForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const formValue = this.settingsForm.value;
    const updateData: UpdateNotificationSettingsDto = {
      appNotifications: formValue.appNotifications,
      emailNotifications: formValue.emailNotifications,
      projectInvitations: formValue.projectInvitations,
      taskAssignments: formValue.taskAssignments,
      taskComments: formValue.taskComments,
      taskStatusChanges: formValue.taskStatusChanges,
      projectUpdates: formValue.projectUpdates,
      systemNotifications: formValue.systemNotifications,
    };

    this.notificationStateService.updateSettings(updateData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false),
        catchError((error: any) => {
          const errorMessage = error.error?.message || this.translateService.instant('Notifications.settingsError');
          this.notificationService.showNotification(
            errorMessage,
            NotificationTypeEnum.Error,
          );
          return of(null);
        }),
      )
      .subscribe({
        next: result => {
          if (result !== null) {
            this.notificationService.showNotification(
              this.translateService.instant('Notifications.settingsUpdated'),
              NotificationTypeEnum.Success,
            );
          }
        },
      });
  }

  private initializeForm(): void {
    this.settingsForm = this.fb.group({
      appNotifications: [true],
      emailNotifications: [true],
      projectInvitations: [true],
      taskAssignments: [true],
      taskComments: [true],
      taskStatusChanges: [true],
      projectUpdates: [true],
      systemNotifications: [true],
    });
  }

  private loadSettings(): void {
    const settings = this.notificationStateService.settings();

    if (settings) {
      this.settingsForm.patchValue({
        appNotifications: settings.appNotifications ?? true,
        emailNotifications: settings.emailNotifications ?? true,
        projectInvitations: settings.projectInvitations ?? true,
        taskAssignments: settings.taskAssignments ?? true,
        taskComments: settings.taskComments ?? true,
        taskStatusChanges: settings.taskStatusChanges ?? true,
        projectUpdates: settings.projectUpdates ?? true,
        systemNotifications: settings.systemNotifications ?? true,
      });
    }
  }
}
