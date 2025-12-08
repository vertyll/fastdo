import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { NotificationTypeEnum } from '../enums/notification.enum';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  public showNotification(
    message: string,
    type: NotificationTypeEnum = NotificationTypeEnum.Info,
    action: string = '',
    duration: number = 3500,
    verticalPosition: MatSnackBarVerticalPosition = 'top',
  ): void {
    this.snackBar.open(message, action, {
      duration: duration,
      verticalPosition: verticalPosition,
      panelClass:
        type === NotificationTypeEnum.Info
          ? ['info-snackbar']
          : type === NotificationTypeEnum.Success
            ? ['success-snackbar']
            : type === NotificationTypeEnum.Error
              ? ['error-snackbar']
              : ['info'],
    });
  }
}
