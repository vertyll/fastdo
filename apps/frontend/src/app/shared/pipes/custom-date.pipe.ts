import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const FORMAT_REGEX = /dd|d|MM|M|yyyy|yy|HH|H|mm|m|ss|s/g;

@Pipe({
  name: 'customDate',
})
export class CustomDatePipe implements PipeTransform {
  private readonly translateService = inject(TranslateService);

  public transform(value: number | string | Date | null, format: string = 'dd.MM.yyyy'): string {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      const errorMessage = this.translateService.instant('Date.invalidDate');
      console.error(errorMessage, value);
      return '';
    }

    return this.formatCustom(date, format);
  }

  private formatCustom(date: Date, format: string): string {
    const pad = (n: number, width = 2): string => n.toString().padStart(width, '0');
    const map: Record<string, string> = {
      dd: pad(date.getDate()),
      d: date.getDate().toString(),
      MM: pad(date.getMonth() + 1),
      M: (date.getMonth() + 1).toString(),
      yyyy: date.getFullYear().toString(),
      yy: pad(date.getFullYear() % 100),
      HH: pad(date.getHours()),
      H: date.getHours().toString(),
      mm: pad(date.getMinutes()),
      m: date.getMinutes().toString(),
      ss: pad(date.getSeconds()),
      s: date.getSeconds().toString(),
    };
    return format.replaceAll(FORMAT_REGEX, match => map[match]);
  }
}
