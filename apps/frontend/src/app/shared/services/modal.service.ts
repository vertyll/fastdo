import { Injectable, computed, signal } from '@angular/core';
import { ModalConfig, ModalOptions } from '../defs/modal.defs';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly modalSignal = signal<ModalConfig>({
    visible: false,
  });

  public modal = computed(() => this.modalSignal());

  private get currentModal(): ModalConfig {
    return this.modalSignal();
  }

  private setModal(val: ModalConfig): void {
    this.modalSignal.set(val);
  }

  public present(options: ModalOptions): void {
    this.setModal({
      visible: true,
      options: { ...options },
    });
  }

  public close(): void {
    this.setModal({
      visible: false,
    });
  }
}
