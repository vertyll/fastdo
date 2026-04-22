import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateText',
  standalone: true,
})
export class TruncateTextPipe implements PipeTransform {
  private readonly DEFAULT_SUFFIX = '...';
  private readonly WORD_PRESERVATION_THRESHOLD = 0.8;

  public transform(
    value: string,
    limit: number | null = null,
    isExpanded: boolean = false,
    suffix: string = this.DEFAULT_SUFFIX,
  ): string {
    if (!value || isExpanded || limit === null || value.length <= limit) {
      return value || '';
    }

    const truncated = value.substring(0, limit);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > limit * this.WORD_PRESERVATION_THRESHOLD) {
      return truncated.substring(0, lastSpaceIndex) + suffix;
    }

    return truncated + suffix;
  }
}
