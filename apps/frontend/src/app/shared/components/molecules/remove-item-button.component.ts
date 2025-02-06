import { Component, inject, input, output } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCheck, heroTrash, heroUser, heroXMark } from '@ng-icons/heroicons/outline';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonRoleEnum } from '../../enums/modal.enum';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-remove-item-button',
  imports: [NgIconComponent, TranslateModule],
  viewProviders: [provideIcons({ heroTrash, heroUser, heroCheck, heroXMark })],
  template: `
    <div class="relative">
      <div
        (click)="removeMode && $event.stopPropagation()"
        class="absolute inset-0 flex items-center justify-center bg-red-700 text-white rounded-md transition-opacity duration-300"
        [class.hidden]="!removeMode || mode() === 'modal'"
      >
        <span class="text-sm font-semibold">
          {{ 'RemoveItemButton.areYouSure' | translate }}
        </span>
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
      </div>
      @if (!removeMode) {
        <button
          (click)="toggleRemoveMode(); $event.stopPropagation()"
          class="flex items-center justify-center p-2 rounded-md transition-all duration-200 text-black dark:text-white hover:scale-125"
        >
          <ng-icon name="heroTrash" size="18"/>
        </button>
      }
    </div>
  `,
  standalone: true,
})
export class RemoveItemButtonComponent {
  private readonly modalService = inject(ModalService);
  private readonly translateService = inject(TranslateService);

  mode = input<'modal' | 'inline'>('modal');

  readonly confirm = output<void>();
  protected removeMode: boolean = false;

  protected toggleRemoveMode(): void {
    if (this.mode() === 'modal') {
      this.modalService.present({
        title: this.translateService.instant('Basic.deleteTitle'),
        message: this.translateService.instant('Basic.confirmDelete'),
        buttons: [
          {
            role: ButtonRoleEnum.Cancel,
            text: this.translateService.instant('Basic.cancel'),
          },
          {
            role: ButtonRoleEnum.Ok,
            text: this.translateService.instant('Basic.delete'),
            handler: () => this.confirm.emit(),
          },
        ],
      });
    } else {
      this.removeMode = true;
    }
  }
}
