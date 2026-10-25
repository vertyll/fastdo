import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { catchError, finalize, of } from 'rxjs';
import { NotificationTypeEnum } from './defs/notification-type.enum';
import { ToastTypeEnum } from '../shared/enums/toast-type.enum';
import { NotificationStateService } from './data-access/notification-state.service';
import { NotificationService } from '../shared/services/notification.service';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { CheckboxComponent } from '../shared/components/atoms/checkbox.component';
import { SpinnerComponent } from '../shared/components/atoms/spinner.component';
import { TitleComponent } from '../shared/components/atoms/title.component';

@Component({
  selector: 'app-notification-settings-page',
  imports: [ReactiveFormsModule, TranslatePipe, TitleComponent, ButtonComponent, CheckboxComponent, SpinnerComponent],
  template: `
    <div class="max-w-3xl mx-auto">
      <app-title [text]="'Notifications.settings' | translate" />

      @if (notificationStateService.settings(); as settings) {
        <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()" class="mt-6 space-y-6">
          <table class="w-full text-left">
            <thead>
              <tr class="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                <th class="py-2">{{ 'Notifications.type' | translate }}</th>
                <th class="px-2 py-2 text-center align-bottom sm:px-4 sm:w-44 sm:whitespace-nowrap">
                  {{ 'Notifications.appNotifications' | translate }}
                </th>
                <th class="px-2 py-2 text-center align-bottom sm:px-4 sm:w-44 sm:whitespace-nowrap">
                  {{ 'Notifications.emailNotifications' | translate }}
                </th>
              </tr>
            </thead>
            <tbody>
              @for (type of settings.availableTypes; track type) {
                <tr class="border-t border-border-primary dark:border-dark-border-primary">
                  <td class="py-3 text-sm font-medium">
                    {{ 'Notifications.types.' + type | translate }}
                  </td>
                  <td class="px-2 py-3 text-center sm:px-4">
                    <app-checkbox [control]="control('app', type)" [id]="'app-' + type" />
                  </td>
                  <td class="px-2 py-3 text-center sm:px-4">
                    <app-checkbox [control]="control('email', type)" [id]="'email-' + type" />
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <div class="flex gap-2">
            <app-button type="submit" [disabled]="saving()">
              {{ 'Basic.save' | translate }}
            </app-button>
            <app-button type="button" (click)="reset()">{{ 'Basic.cancel' | translate }}</app-button>
          </div>
        </form>
      } @else {
        <div class="flex justify-center items-center h-48">
          <app-spinner />
        </div>
      }
    </div>
  `,
})
export class NotificationSettingsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);

  protected readonly notificationStateService = inject(NotificationStateService);
  protected readonly saving = signal(false);

  protected settingsForm: FormGroup = this.fb.group({});

  private readonly availableTypes = computed(() => this.notificationStateService.settings()?.availableTypes ?? []);

  ngOnInit(): void {
    this.reset();
  }

  protected control(channel: 'app' | 'email', type: NotificationTypeEnum): FormControl {
    const name = `${channel}:${type}`;
    let control = this.settingsForm.get(name) as FormControl | null;
    if (!control) {
      control = this.fb.control(false);
      this.settingsForm.addControl(name, control);
    }
    return control;
  }

  protected reset(): void {
    const settings = this.notificationStateService.settings();
    if (!settings) {
      return;
    }

    for (const type of settings.availableTypes) {
      this.control('app', type).setValue(!settings.mutedTypes.includes(type));
      this.control('email', type).setValue(settings.emailEnabledTypes.includes(type));
    }
  }

  protected onSubmit(): void {
    const types = this.availableTypes();
    const mutedTypes = types.filter(type => !this.control('app', type).value);
    const emailEnabledTypes = types.filter(type => this.control('email', type).value && !mutedTypes.includes(type));

    this.saving.set(true);
    this.notificationStateService
      .updateSettings({ mutedTypes, emailEnabledTypes })
      .pipe(
        catchError(() => {
          this.notificationService.showNotification(
            this.translateService.instant('Notifications.settingsUpdateError'),
            ToastTypeEnum.Error,
          );
          return of(null);
        }),
        finalize(() => this.saving.set(false)),
      )
      .subscribe(settings => {
        if (settings) {
          this.notificationService.showNotification(
            this.translateService.instant('Notifications.settingsUpdated'),
            ToastTypeEnum.Success,
          );
        }
      });
  }
}
