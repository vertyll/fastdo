import { Component, input } from '@angular/core';

export type BadgeVariant = 'neutral' | 'accent' | 'warning' | 'danger';
export type BadgeShape = 'label' | 'code';

@Component({
  selector: 'app-badge',
  template: `
    <span [class]="classes()">
      <ng-content />
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
    `,
  ],
})
export class BadgeComponent {
  public readonly variant = input<BadgeVariant>('neutral');

  public readonly shape = input<BadgeShape>('label');

  protected classes(): string {
    return ['px-1.5 py-0.5 rounded whitespace-nowrap', this.shapeClasses(), this.variantClasses()].join(' ');
  }

  private shapeClasses(): string {
    return this.shape() === 'code' ? 'font-mono text-[11px]' : 'text-[10px] font-semibold';
  }

  private variantClasses(): string {
    switch (this.variant()) {
      case 'accent':
        return 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200';
      case 'warning':
        return 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-200';
      case 'danger':
        return 'bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-200';
      default:
        return 'bg-surface-secondary dark:bg-dark-surface-secondary text-text-secondary dark:text-dark-text-secondary';
    }
  }
}
