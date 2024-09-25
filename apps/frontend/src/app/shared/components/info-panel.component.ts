import { Component, Input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  bootstrapArrowLeft,
  bootstrapArrowRight,
} from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-info-panel',
  standalone: true,
  imports: [NgIconComponent],
  providers: [provideIcons({ bootstrapArrowLeft, bootstrapArrowRight })],
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
            <ng-icon name="bootstrapArrowLeft"></ng-icon>
          } @else {
            <ng-icon name="bootstrapArrowRight"></ng-icon>
          }
        </div>
        <div class="info-panel" [class.open]="panelOpen">
          <div>
            <b>User roles</b>:
            <span class="text-green-500"> {{ userRolesString }} </span>
          </div>
          <div>
            <b>Current time</b>:
            <span class="text-green-500"> {{ currentTime }} </span>
          </div>
          <div>
            <b>Browser info</b>:
            {{ browserInfo }}
          </div>
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
