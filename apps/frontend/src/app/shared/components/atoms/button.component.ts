import { Component, booleanAttribute, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

export type ButtonVariant = 'basic' | 'flat' | 'stroked' | 'icon' | 'danger';

@Component({
  selector: 'app-button',
  imports: [CommonModule, MatButtonModule],
  template: `
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>

    @if (variant() === 'basic') {
      <button
        mat-button
        [type]="type()"
        [disabled]="disabled()"
        [title]="title()"
        [attr.aria-label]="title() || null"
        (click)="clicked.emit($event)"
      >
        <span class="flex items-center justify-center gap-2">
          <ng-container *ngTemplateOutlet="contentTemplate" />
        </span>
      </button>
    } @else if (variant() === 'stroked') {
      <button
        mat-stroked-button
        [type]="type()"
        [disabled]="disabled()"
        [title]="title()"
        [attr.aria-label]="title() || null"
        (click)="clicked.emit($event)"
      >
        <span class="flex items-center justify-center gap-2">
          <ng-container *ngTemplateOutlet="contentTemplate" />
        </span>
      </button>
    } @else if (variant() === 'danger') {
      <button
        mat-flat-button
        class="!bg-danger-500 hover:!bg-danger-600 !text-white"
        [type]="type()"
        [disabled]="disabled()"
        [title]="title()"
        [attr.aria-label]="title() || null"
        (click)="clicked.emit($event)"
      >
        <span class="flex items-center justify-center gap-2">
          <ng-container *ngTemplateOutlet="contentTemplate" />
        </span>
      </button>
    } @else if (variant() === 'icon') {
      <button
        mat-icon-button
        [type]="type()"
        [disabled]="disabled()"
        [title]="title()"
        [attr.aria-label]="title() || null"
        (click)="clicked.emit($event)"
      >
        <span class="icon-slot flex items-center justify-center">
          <ng-container *ngTemplateOutlet="contentTemplate" />
        </span>
      </button>
    } @else {
      <button
        mat-flat-button
        [type]="type()"
        [disabled]="disabled()"
        [title]="title()"
        [attr.aria-label]="title() || null"
        (click)="clicked.emit($event)"
      >
        <span class="flex items-center justify-center gap-2">
          <ng-container *ngTemplateOutlet="contentTemplate" />
        </span>
      </button>
    }
  `,
  styles: [
    `
      .icon-slot ::ng-deep svg {
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class ButtonComponent {
  public readonly type = input<'button' | 'submit' | 'reset'>('button');

  public readonly disabled = input(false, { transform: booleanAttribute });

  public readonly variant = input<ButtonVariant>('flat');

  public readonly title = input<string>('');
  public readonly clicked = output<Event>();
}
