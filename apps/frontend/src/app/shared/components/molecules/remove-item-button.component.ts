import { Component, output } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCheck, heroTrash, heroUser, heroXMark } from '@ng-icons/heroicons/outline';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-remove-item-button',
  imports: [NgIconComponent, TranslateModule],
  viewProviders: [provideIcons({ heroTrash, heroUser, heroCheck, heroXMark })],
  template: `
    <div
      (click)="removeMode && $event.stopPropagation()"
      class="flex items-center rounded-md"
      [class.bg-red-700]="removeMode"
      [class.text-white]="removeMode"
    >
      <span
        class="text-sm transition-transform duration-300 h-full py-2 pl-2 rounded-md font-semibold flex items-center"
        [class.invisible]="!removeMode"
        [class.bg-red-700]="removeMode"
      >
        {{ 'RemoveItemButton.areYouSure' | translate }}
      </span>

      @if (!removeMode; as value) {
        <button
          (click)="removeMode = true; $event.stopPropagation()"
          class="flex items-center justify-center p-2 rounded-md transition-all duration-200 text-black dark:text-white hover:scale-125"
        >
          <ng-icon name="heroTrash" size="18"/>
        </button>
      } @else {
        <button
          (click)="removeMode = false; $event.stopPropagation()"
          class="flex items-center justify-center p-2 rounded-md transition-all duration-200 hover:scale-125"
        >
          <ng-icon name="heroXMark" size="18"/>
        </button>
        <button
          (click)="confirm.emit(); removeMode = false; $event.stopPropagation()"
          class="flex items-center justify-center p-2 rounded-md transition-all duration-200 hover:scale-125"
        >
          <ng-icon name="heroCheck" size="18"/>
        </button>
      }
    </div>
  `,
  standalone: true,
})
export class RemoveItemButtonComponent {
  readonly confirm = output<void>();
  protected removeMode: boolean = false;
}
