import { Component, Input } from '@angular/core';
import { AuthService } from 'src/app/auth/data-access/auth.service';

@Component({
  selector: 'app-info-panel',
  standalone: true,
  styles: [
    `
      .info-panel {
        @apply fixed bottom-0 right-0 bg-gray-800 text-white p-4 transition-transform transform translate-x-full;
        width: calc(100% - 40px);
      }
      .info-panel.open {
        @apply translate-x-0;
      }
      .toggle-button {
        @apply fixed bottom-0 right-0 bg-orange-500 text-white p-4 cursor-pointer flex items-center justify-center;
        z-index: 10;
        width: 40px;
        height: 40px;
        user-select: none;
      }
    `,
  ],
  template: `
    @if (isLoggedIn()) {
      <div>
        <div class="toggle-button" (click)="togglePanel()">
          @if (!panelOpen) {
            <span>&#8592;</span>
          } @else {
            <span>&#8594;</span>
          }
        </div>
        <div class="info-panel" [class.open]="panelOpen">
          <div>Your roles: {{ userRolesString }}</div>
          <div>Current time: {{ currentTime }}</div>
          <div>Browser info: {{ browserInfo }}</div>
        </div>
      </div>
    }
  `,
})
export class InfoPanelComponent {
  @Input() panelOpen: boolean = false;
  @Input() togglePanel!: () => void;
  @Input() userRolesString: string = '';
  @Input() currentTime: string = '';
  @Input() browserInfo: string = '';
  @Input() isLoggedIn!: () => boolean;
}
