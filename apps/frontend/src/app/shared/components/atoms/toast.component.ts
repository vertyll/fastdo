import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  template: `
    @if(toast().visible) {
      <div
        [class]="toast().position === 'fixed'
          ? 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 min-w-[200px]'
          : 'w-full mb-4'"
        class="flex items-center justify-between rounded shadow-lg p-4"
        [ngClass]="toast().success ? 'bg-green-500' : 'bg-red-500'"
      >
        <div class="text-white flex-grow" [innerHTML]="toast().message"></div>
        <button
          class="rounded px-3.5 py-2 ml-4 bg-opacity-20 bg-black text-white hover:bg-opacity-30 transition-colors shrink-0"
          (click)="hideToast()"
        >
          ✕
        </button>
      </div>
    }
  `,
  styles: [],
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  protected readonly toast = this.toastService.toast;

  hideToast(): void {
    this.toastService.hideToast();
  }
}
