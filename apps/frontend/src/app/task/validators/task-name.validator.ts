import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class TaskNameValidator {
  private readonly translateService = inject(TranslateService);

  public validateTaskName(taskName: string): { isValid: boolean; error?: string; } {
    if (!taskName || taskName.length < 3) {
      return {
        isValid: false,
        error: this.translateService.instant('Task.taskNameMinLength'),
      };
    }
    return { isValid: true };
  }
}
