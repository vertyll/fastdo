import {Injectable, inject} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ProjectNameValidator {
  private readonly translateService = inject(TranslateService);

  public validateProjectName(projectName: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!projectName || projectName.length < 3) {
      return {
        isValid: false,
        error: this.translateService.instant('Project.projectNameMinLength'),
      };
    }
    return {isValid: true};
  }
}
