import {inject, Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
  name: 'customDate',
})
export class CustomDatePipe implements PipeTransform {
  private readonly translateService = inject(TranslateService);

  public transform(value: number | string | Date | null): string {
    if (!value) return '';

    let date: Date;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'number') {
      date = new Date(value);
    } else {
      date = new Date(value);
    }

    if (isNaN(date.getTime())) {
      const errorMessage = this.translateService.instant('Date.invalidDate');
      console.error(errorMessage, value);
      return '';
    }

    return new Intl.DateTimeFormat('pl').format(date);
  }
}
