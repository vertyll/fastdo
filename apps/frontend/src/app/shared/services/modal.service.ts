import { Injectable, signal, computed } from '@angular/core';
import { ModalConfig, ModalOptions } from '../interfaces/modal.interface';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalSignal = signal<ModalConfig>({
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

  public updateConfig(options: Partial<ModalOptions>): void {
    const current = this.currentModal;
    if (current.options) {
      this.setModal({
        visible: true,
        options: {
          ...current.options,
          ...options,
        },
      });
    }
  }

  public updateLoading(loading: boolean): void {
    const current = this.currentModal;
    if (current.options) {
      this.setModal({
        ...current,
        options: {
          ...current.options,
          loading,
        },
      });
    }
  }

  public updateSelectOptions(selectOptions: any[]): void {
    const current = this.currentModal;
    if (current.options?.inputs) {
      const updatedInputs = current.options.inputs.map((input) => {
        if (input.selectOptions) {
          return { ...input, selectOptions };
        }
        return input;
      });

      this.setModal({
        ...current,
        options: {
          ...current.options,
          inputs: updatedInputs,
        },
      });
    }
  }
}
