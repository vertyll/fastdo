import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationTypeEnum } from '../../enums/notification.enum';
import { NotificationStateService } from '../../services/notification-state.service';
import { NotificationService } from '../../services/notification.service';
import { UpdateNotificationSettingsDto } from '../../types/notification.type';
import { ButtonComponent } from '../atoms/button.component';
import { TitleComponent } from '../atoms/title.component';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    TitleComponent,
    ButtonComponent,
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
            <input
              type="checkbox"
              formControlName="appNotifications"
              class="h-4 w-4 text-primary-600 rounded border-border-primary focus:ring-primary-500"
            />
          </div>

          <!-- Email Notifications -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {{ 'Notifications.emailNotifications' | translate }}
              </label>
            </div>
            <input
              type="checkbox"
              formControlName="emailNotifications"
              class="h-4 w-4 text-primary-600 rounded border-border-primary focus:ring-primary-500"
            />
          </div>

          <!-- Project Invitations -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {{ 'Notifications.projectInvitations' | translate }}
              </label>
            </div>
            <input
              type="checkbox"
              formControlName="projectInvitations"
              class="h-4 w-4 text-primary-600 rounded border-border-primary focus:ring-primary-500"
            />
          </div>

          <!-- Task Assignments -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {{ 'Notifications.taskAssignments' | translate }}
              </label>
            </div>
            <input
              type="checkbox"
              formControlName="taskAssignments"
              class="h-4 w-4 text-primary-600 rounded border-border-primary focus:ring-primary-500"
            />
          </div>

          <!-- Task Comments -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {{ 'Notifications.taskComments' | translate }}
              </label>
            </div>
            <input
              type="checkbox"
              formControlName="taskComments"
              class="h-4 w-4 text-primary-600 rounded border-border-primary focus:ring-primary-500"
            />
          </div>

          <!-- Task Status Changes -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {{ 'Notifications.taskStatusChanges' | translate }}
              </label>
            </div>
            <input
              type="checkbox"
              formControlName="taskStatusChanges"
              class="h-4 w-4 text-primary-600 rounded border-border-primary focus:ring-primary-500"
            />
          </div>

          <!-- Project Updates -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {{ 'Notifications.projectUpdates' | translate }}
              </label>
            </div>
            <input
              type="checkbox"
              formControlName="projectUpdates"
              class="h-4 w-4 text-primary-600 rounded border-border-primary focus:ring-primary-500"
            />
          </div>

          <!-- System Notifications -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                {{ 'Notifications.systemNotifications' | translate }}
              </label>
            </div>
            <input
              type="checkbox"
              formControlName="systemNotifications"
              class="h-4 w-4 text-primary-600 rounded border-border-primary focus:ring-primary-500"
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
export class NotificationSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly notificationStateService = inject(NotificationStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);

  protected settingsForm!: FormGroup;
  protected isSubmitting: boolean = false;

  ngOnInit(): void {
    this.initializeForm();
    this.loadSettings();
  }

  protected async onSubmit(): Promise<void> {
    if (this.settingsForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    try {
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

      await this.notificationStateService.updateSettings(updateData);

      this.notificationService.showNotification(
        this.translateService.instant('Notifications.settingsUpdated'),
        NotificationTypeEnum.Success,
      );
    } catch (error: any) {
      const errorMessage = error.error?.message || this.translateService.instant('Notifications.settingsError');
      this.notificationService.showNotification(
        errorMessage,
        NotificationTypeEnum.Error,
      );
    } finally {
      this.isSubmitting = false;
    }
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

  private async loadSettings(): Promise<void> {
    try {
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
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }
}
