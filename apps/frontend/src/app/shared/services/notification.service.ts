import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { NotificationType } from '../enums/notification.enum';
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private readonly snackBar: MatSnackBar) {}

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
        type === 'info'
          ? ['info-snackbar']
          : type === 'success'
            ? ['success-snackbar']
            : type === 'error'
              ? ['error-snackbar']
              : ['info'],
    });
  }
}
