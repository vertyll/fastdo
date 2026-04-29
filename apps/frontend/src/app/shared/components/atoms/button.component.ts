import { Component, input, output, booleanAttribute } from '@angular/core'; // <-- Dodaj booleanAttribute
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

export type ButtonVariant = 'basic' | 'flat' | 'stroked' | 'icon';

@Component({
  selector: 'app-button',
  imports: [CommonModule, TranslateModule, MatButtonModule],
  template: `
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>

    @if (variant() === 'basic') {
      <button mat-button [type]="type()" [disabled]="disabled()" (click)="clicked.emit($event)">
        <span class="flex items-center justify-center gap-2">
          <ng-container *ngTemplateOutlet="contentTemplate" />
        </span>
      </button>
    } @else if (variant() === 'stroked') {
      <button mat-stroked-button [type]="type()" [disabled]="disabled()" (click)="clicked.emit($event)">
        <span class="flex items-center justify-center gap-2">
          <ng-container *ngTemplateOutlet="contentTemplate" />
        </span>
      </button>
    } @else if (variant() === 'icon') {
      <button mat-icon-button [type]="type()" [disabled]="disabled()" (click)="clicked.emit($event)">
        <span class="flex items-center justify-center">
          <ng-container *ngTemplateOutlet="contentTemplate" />
        </span>
      </button>
    } @else {
      <button mat-flat-button [type]="type()" [disabled]="disabled()" (click)="clicked.emit($event)">
        <span class="flex items-center justify-center gap-2">
          <ng-container *ngTemplateOutlet="contentTemplate" />
        </span>
      </button>
    }
  `,
})
export class ButtonComponent {
  public readonly type = input<'button' | 'submit' | 'reset'>('button');

  public readonly disabled = input(false, { transform: booleanAttribute });

  public readonly variant = input<ButtonVariant>('flat');
  public readonly clicked = output<Event>();
}
