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
    let panelClass: string[];
    if (type === NotificationTypeEnum.Info) {
      panelClass = ['info-snackbar'];
    } else if (type === NotificationTypeEnum.Success) {
      panelClass = ['success-snackbar'];
    } else if (type === NotificationTypeEnum.Error) {
      panelClass = ['error-snackbar'];
    } else {
      panelClass = ['info'];
    }

    this.snackBar.open(message, action, {
      duration: duration,
      verticalPosition: verticalPosition,
      panelClass: panelClass,
    });
  }
}
