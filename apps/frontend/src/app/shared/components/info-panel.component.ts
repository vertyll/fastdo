import { Component, Input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroArrowRight } from '@ng-icons/heroicons/outline';
@Component({
  selector: 'app-info-panel',
  standalone: true,
  imports: [NgIconComponent],
  providers: [provideIcons({ heroArrowLeft, heroArrowRight })],
  template: `
    @if (isLoggedIn()) {
      <div>
        <div
          class="fixed bottom-0 right-0 bg-orange-500 text-white p-2 cursor-pointer flex items-center justify-center z-10 w-10 h-10 user-select-none rounded-tl-md"
          (click)="togglePanel()"
        >
          @if (!panelOpen) {
            <ng-icon name="heroArrowLeft"></ng-icon>
          } @else {
            <ng-icon name="heroArrowRight"></ng-icon>
          }
        </div>
        <div
          class="fixed bottom-0 right-0 bg-gray-800 text-white p-4 transition-transform transform w-[calc(100%-40px)] rounded-tl-md duration-300 ease-in-out"
          [class.translate-x-0]="panelOpen"
          [class.translate-x-full]="!panelOpen"
        >
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
