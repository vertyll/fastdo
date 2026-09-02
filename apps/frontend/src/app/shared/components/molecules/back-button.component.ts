import { Component, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeft } from '@ng-icons/heroicons/outline';
import { ButtonComponent } from '../atoms/button.component';

@Component({
  selector: 'app-back-button',
  imports: [CommonModule, TranslatePipe, NgIcon, ButtonComponent],
  providers: [
    provideIcons({
      heroArrowLeft,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <app-button variant="basic" (clicked)="clicked.emit()">
      <ng-icon name="heroArrowLeft" size="20"></ng-icon>
      <span>{{ 'Basic.back' | translate }}</span>
    </app-button>
  `,
})
export class BackButtonComponent {
  public readonly clicked = output<void>();
}
