import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeft } from '@ng-icons/heroicons/outline';
import { ButtonComponent } from '../atoms/button.component';

@Component({
  selector: 'app-back-button',
  imports: [CommonModule, TranslateModule, NgIcon, ButtonComponent],
  providers: [
    provideIcons({
      heroArrowLeft,
    }),
  ],
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
