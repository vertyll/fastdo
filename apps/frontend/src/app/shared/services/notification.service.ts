import { Injectable, inject } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { NotificationType } from '../enums/notification.enum';
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  public showNotification(
    message: string,
    type: NotificationType = NotificationType.info,
    action: string = '',
    duration: number = 3500,
    verticalPosition: MatSnackBarVerticalPosition = 'top',
  ): void {
    this.snackBar.open(message, action, {
      duration: duration,
      verticalPosition: verticalPosition,
      panelClass:
        type === NotificationType.info
          ? ['info-snackbar']
          : type === NotificationType.success
            ? ['success-snackbar']
            : type === NotificationType.error
              ? ['error-snackbar']
              : ['info'],
    });
  }
}
