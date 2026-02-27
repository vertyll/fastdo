import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateText',
  standalone: true,
})
export class TruncateTextPipe implements PipeTransform {
  public transform(
    value: string,
    limit: number | null = null,
    isExpanded: boolean = false,
    suffix: string = '...',
  ): string {
    if (!value) return '';
    if (isExpanded) return value;
    if (limit === null) return value;

    if (value.length <= limit) return value;

    const truncated = value.substring(0, limit);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > limit * 0.8) {
      return truncated.substring(0, lastSpaceIndex) + suffix;
    }

    return truncated + suffix;
  }
}
