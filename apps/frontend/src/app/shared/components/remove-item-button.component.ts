import { Component, EventEmitter, Output } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroTrash,
  heroUser,
  heroCheck,
  heroXMark,
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-remove-item-button',
  standalone: true,
  imports: [NgIconComponent],
  viewProviders: [provideIcons({ heroTrash, heroUser, heroCheck, heroXMark })],
  template: `
    <div
      (click)="removeMode && $event.stopPropagation()"
      class="flex items-center rounded-md"
      [class.bg-red-700]="removeMode"
      [class.text-white]="removeMode"
    >
      <span
        class="text-sm transition-transform duration-300 h-full py-2 pl-2 rounded-md font-semibold"
        [class.invisible]="!removeMode"
        [class.-translate-x-6]="removeMode"
        [class.bg-red-700]="removeMode"
        >Are you sure?</span
      >

      @if (!removeMode; as value) {
        <button
          (click)="removeMode = true; $event.stopPropagation()"
          class="flex hover:bg-white hover:rounded-full"
        >
          <ng-icon name="heroTrash" class="icon--hover" />
        </button>
      } @else {
        <button
          (click)="removeMode = false; $event.stopPropagation()"
          class="flex mr-1"
        >
          <ng-icon name="heroXMark" class="hover:bg-white icon--hover" />
        </button>
        <button
          (click)="confirm.emit(); removeMode = false; $event.stopPropagation()"
          class="flex pr-2"
        >
          <ng-icon name="heroCheck" class="hover:bg-white icon--hover" />
        </button>
      }
    </div>
  `,
  styles: [
    `
      .icon--hover {
        @apply hover:text-red-700 hover:rounded-full;
      }
    `,
  ],
})
export class RemoveItemButtonComponent {
  @Output() confirm: EventEmitter<void> = new EventEmitter<void>();

  protected removeMode: boolean = false;
}
