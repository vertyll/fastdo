import { Component, computed, input } from '@angular/core';

export type BadgeVariant = 'neutral' | 'accent' | 'warning' | 'danger' | 'success' | 'custom';
export type BadgeShape = 'label' | 'code' | 'pill';

@Component({
  selector: 'app-badge',
  template: `
    <span [class]="classes()" [style.background-color]="background()" [style.color]="foreground()">
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
  public readonly background = input<string | null>(null);
  public readonly foreground = input<string | null>(null);

  protected readonly classes = computed(() =>
    ['inline-flex items-center whitespace-nowrap', this.shapeClasses(), this.variantClasses()].join(' '),
  );

  private shapeClasses(): string {
    switch (this.shape()) {
      case 'code':
        return 'px-1.5 py-0.5 rounded font-mono text-[11px]';
      case 'pill':
        return 'px-2 py-1 rounded-full text-xs font-medium';
      default:
        return 'px-1.5 py-0.5 rounded text-[10px] font-semibold';
    }
  }

  private variantClasses(): string {
    switch (this.variant()) {
      case 'accent':
        return 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200';
      case 'warning':
        return 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-200';
      case 'danger':
        return 'bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-200';
      case 'success':
        return 'bg-success-100 text-success-800 dark:bg-success-800 dark:text-success-200';
      case 'custom':
        return '';
      default:
        return 'bg-surface-variant dark:bg-dark-surface-variant text-text-secondary dark:text-dark-text-secondary';
    }
  }
}
