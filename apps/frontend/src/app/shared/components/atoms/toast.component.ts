import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, NgIcon],
  template: `
    @if (toast().visible) {
      <div
        [class]="
          toast().position === 'Fixed' ? 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 min-w-50' : 'w-full mb-4'
        "
        class="flex items-center justify-between rounded shadow-lg p-4"
        [ngClass]="toast().success ? 'bg-success-500' : 'bg-danger-500'"
      >
        <div class="text-white grow" [innerHTML]="toast().message"></div>
        <button
          class="rounded p-1.5 ml-4 bg-black/50 text-white hover:opacity-30 transition-colors shrink-0 flex items-center justify-center"
          (click)="hideToast()"
        >
          <ng-icon name="heroXMark" class="w-4 h-4" />
        </button>
      </div>
    }
  `,
  viewProviders: [
    provideIcons({
      heroXMark,
    }),
  ],
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  protected readonly toast = this.toastService.toast;

  hideToast(): void {
    this.toastService.hideToast();
  }
}
