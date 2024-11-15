import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModalConfig, ModalOptions } from '../interfaces/modal.interface';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private _modal: ModalConfig = {
    visible: false,
  };

  public modal$ = new BehaviorSubject(this.modal);

  set modal(val) {
    this._modal = val;
    this.modal$.next(val);
  }

  get modal() {
    return this._modal;
  }

  public present(options: ModalOptions) {
    this.modal = {
      visible: true,
      options: { ...options },
    };
  }

  public close() {
    this.modal = {
      visible: false,
    };
  }

  public updateConfig(options: Partial<ModalOptions>) {
    if (this.modal.options?.title) {
      this.modal = {
        visible: true,
        options: {
          ...this.modal.options,
          ...options,
        },
      };
    }
  }

  public updateLoading(loading: boolean) {
    if (this._modal && this._modal.options) {
      this.modal = {
        ...this._modal,
        options: {
          ...this._modal.options,
          loading: loading,
        },
      };
    }
  }

  public updateSelectOptions(selectOptions: any[]) {
    if (this._modal.options && this._modal.options.inputs) {
      this._modal.options.inputs.forEach((input) => {
        if (input.selectOptions) {
          input.selectOptions = selectOptions;
        }
      });
      this.modal$.next(this._modal);
    }
  }
}
