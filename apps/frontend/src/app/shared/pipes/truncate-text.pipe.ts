import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateText',
  standalone: true,
  pure: true,
})
export class TruncateTextPipe implements PipeTransform {
  public transform(
    value: string | undefined,
    maxLength: number = 150,
    isExpanded: boolean = false,
    suffix: string = ' [...]',
  ): string {
    if (!value) return '';

    if (value.length <= maxLength || isExpanded) {
      return value;
    }

    return value.slice(0, maxLength) + suffix;
  }
}
