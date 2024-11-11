import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ProjectNameValidator {
  constructor(private translateService: TranslateService) {}

  validateProjectName(projectName: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!projectName || projectName.length < 3) {
      return {
        isValid: false,
        error: this.translateService.instant('Auth.projectNameMinLength'),
      };
    }
    return { isValid: true };
  }
}
