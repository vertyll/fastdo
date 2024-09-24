import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate',
  standalone: true,
})
export class CustomDatePipe implements PipeTransform {
  transform(value: number | string | Date): string {
    if (!value) return '';

    let date: Date;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'number' || typeof value === 'string') {
      date = new Date(value);
    } else {
      return '';
    }

    if (isNaN(date.getTime())) {
      console.error('Invalid date:', value);
      return '';
    }

    return new Intl.DateTimeFormat('pl').format(date);
  }
}
