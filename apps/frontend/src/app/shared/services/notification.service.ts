import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ToastTypeEnum } from '../enums/toast-type.enum';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  public showNotification(
    message: string,
    type: ToastTypeEnum = ToastTypeEnum.Info,
    action: string = '',
    duration: number = 3500,
    verticalPosition: MatSnackBarVerticalPosition = 'top',
  ): void {
    let panelClass: string[];
    if (type === ToastTypeEnum.Info) {
      panelClass = ['info-snackbar'];
    } else if (type === ToastTypeEnum.Success) {
      panelClass = ['success-snackbar'];
    } else if (type === ToastTypeEnum.Error) {
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
