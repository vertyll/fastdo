import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NotificationDto } from '../../defs/notification.defs';

@Component({
  selector: 'app-notification-details',
  imports: [TranslatePipe],
  template: `
    <div class="space-y-4 text-left">
      <p class="text-sm text-text-primary dark:text-dark-text-primary">
        {{ notification.messageKey | translate: notification.params }}
      </p>

      <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
        <dt class="text-text-secondary dark:text-dark-text-secondary">{{ 'Notifications.type' | translate }}</dt>
        <dd class="text-text-primary dark:text-dark-text-primary">
          {{ 'Notifications.types.' + notification.type | translate }}
        </dd>

        <dt class="text-text-secondary dark:text-dark-text-secondary">
          {{ 'Notifications.receivedAt' | translate }}
        </dt>
        <dd class="text-text-primary dark:text-dark-text-primary">{{ receivedAt }}</dd>

        <dt class="text-text-secondary dark:text-dark-text-secondary">{{ 'Notifications.status' | translate }}</dt>
        <dd class="text-text-primary dark:text-dark-text-primary">
          {{ (notification.isRead ? 'Notifications.read' : 'Notifications.unread') | translate }}
        </dd>
      </dl>
    </div>
  `,
})
export class NotificationDetailsComponent {
  public notification!: NotificationDto;
  public receivedAt = '';
}
