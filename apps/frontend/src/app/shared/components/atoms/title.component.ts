import { Component, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TruncateTextPipe } from '../../pipes/truncate-text.pipe';

@Component({
  selector: 'app-title',
  standalone: true,
  imports: [MatTooltipModule, TruncateTextPipe],
  template: `
    <h2 class="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
      <span [matTooltip]="limit() !== null && text().length > limit()! ? text() : ''" matTooltipPosition="above">
        {{ text() | truncateText: limit() }}
      </span>
    </h2>
  `,
})
export class TitleComponent {
  readonly text = input.required<string>();
  readonly limit = input<number | null>(null);
}
