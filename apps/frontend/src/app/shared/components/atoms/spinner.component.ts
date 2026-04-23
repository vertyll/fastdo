import { Component, computed, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpinnerSize } from '../../defs/components.defs';

@Component({
  imports: [MatProgressSpinnerModule],
  selector: 'app-spinner',
  template: ` <mat-progress-spinner mode="indeterminate" [diameter]="diameter()" /> `,
})
export class SpinnerComponent {
  public readonly size = input<SpinnerSize>('medium');

  protected readonly diameter = computed(() => {
    switch (this.size()) {
      case 'small':
        return 24;
      case 'large':
        return 64;
      case 'medium':
      default:
        return 40;
    }
  });
}
