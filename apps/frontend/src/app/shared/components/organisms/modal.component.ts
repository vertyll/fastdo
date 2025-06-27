import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMarkSolid } from '@ng-icons/heroicons/solid';
import { AdDirective } from 'src/app/core/directives/ad.directive';
import { ButtonRoleEnum, ModalInputTypeEnum } from '../../enums/modal.enum';
import { InputInvalidPipe } from '../../pipes/input-invalid.pipe';
import { ModalService } from '../../services/modal.service';
import { ModalConfig } from '../../types/modal.type';
import { ButtonComponent } from '../atoms/button.component';
import { CheckboxComponent } from '../atoms/checkbox.component';
import { ErrorMessageComponent } from '../atoms/error.message.component';
import { InputComponent } from '../atoms/input.component';
import { LabelComponent } from '../atoms/label.component';
import { SpinnerComponent } from '../atoms/spinner.component';
import { TextareaComponent } from '../atoms/textarea-component';

@Component({
  selector: 'app-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SpinnerComponent,
    InputInvalidPipe,
    CheckboxComponent,
    InputComponent,
    TextareaComponent,
    ButtonComponent,
    ErrorMessageComponent,
    NgIconComponent,
    TextareaComponent,
    LabelComponent,
    AdDirective,
  ],
  viewProviders: [provideIcons({ heroXMarkSolid })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-spacing-4"
      tabindex="-1"
      role="dialog"
      [ngStyle]="{ display: modalService.modal().visible ? 'flex' : 'none' }"
      data-keyboard="true"
    >
      <div
        class="w-full max-w-lg bg-background-primary rounded-borderRadius-lg shadow-boxShadow-lg dark:bg-dark-background-primary dark:text-dark-text-primary transition-colors duration-transitionDuration-200"
        role="document"
      >
        <div class="px-spacing-6 py-spacing-4 border-b border-border-primary dark:border-dark-border-primary flex justify-between items-center">
          <h4 class="text-xl font-semibold">
            {{ modalService.modal().options?.title }}
          </h4>
          <button (click)="closeModalIconHandler()" aria-label="Close">
            <ng-icon
              name="heroXMarkSolid"
              class="w-6 h-6 text-text-secondary hover:text-text-primary dark:text-dark-text-primary dark:hover:text-dark-text-secondary transition-colors duration-transitionDuration-200"
            ></ng-icon>
          </button>
        </div>

        <div class="px-spacing-6 py-spacing-4">
          @if (modalService.modal().options?.loading) {
            <div class="flex justify-center py-spacing-4">
              <app-spinner/>
            </div>
          }

          @if (modalService.modal().options?.message) {
            <p
              [innerHTML]="modalService.modal().options?.message"
              class="mb-spacing-4"
            ></p>
          }

          <ng-container adHost></ng-container>

          @if (modalService.modal().options?.inputs?.length && form) {
            <form [formGroup]="form" (ngSubmit)="saveModal()" #formElement>
              @for (input of modalService.modal().options?.inputs;
                track input.id) {
                @if (input.message) {
                  <p [innerHTML]="input.message" class="mt-spacing-3 mb-spacing-2"></p>
                }

                <div class="mb-spacing-4" [ngClass]="form.get(input.id) | inputInvalid">
                  <div
                    [ngClass]="{
                      'flex items-center':
                        input.type === ModalInputType.Checkbox,
                      block: input.type !== ModalInputType.Checkbox,
                    }"
                  >
                    @if (input.label) {
                      <app-label [forId]="input.id">
                        {{ input.label }}
                      </app-label>
                    }
                    @switch (input.type) {
                      @case (ModalInputType.Checkbox) {
                        <app-checkbox
                          [id]="input.id"
                          [checked]="input.value"
                          [control]="getFormControl(input.id)"
                        />
                      }
                      @case (ModalInputType.Textarea) {
                        <app-textarea
                          [id]="input.id"
                          [control]="getFormControl(input.id)"
                          [rows]="3"
                        />
                      }
                      @case (ModalInputType.Date) {
                        <app-input
                          [id]="input.id"
                          [type]="ModalInputType.Date"
                          [control]="getFormControl(input.id)"
                        />
                      }
                      @case (ModalInputType.DatetimeLocal) {
                        <app-input
                          [id]="input.id"
                          [type]="ModalInputType.DatetimeLocal"
                          [control]="getFormControl(input.id)"
                        />
                      }
                      @case (ModalInputType.Number) {
                        <app-input
                          [id]="input.id"
                          [type]="ModalInputType.Number"
                          [control]="getFormControl(input.id)"
                        />
                      }
                      @default {
                        <app-input
                          [id]="input.id"
                          [type]="ModalInputType.Text"
                          [control]="getFormControl(input.id)"
                        />
                      }
                    }
                  </div>

                  <app-error-message [input]="form.get(input.id)"/>
                  @if (input.error) {
                    <app-error-message [customMessage]="input.error"/>
                  }
                </div>
              }

              @if (modalService.modal().options?.error) {
                <app-error-message
                  [customMessage]="modalService.modal().options?.error"
                />
              }
            </form>
          }
        </div>

        <div class="px-spacing-6 py-spacing-4 border-t border-border-primary dark:border-dark-border-primary flex justify-end space-x-spacing-2">
          @for (button of modalService.modal().options?.buttons;
            track button.role) {
            @switch (button.role) {
              @case (ButtonRole.Cancel) {
                <app-button
                  (click)="closeModal(button)"
                  [disabled]="modalService.modal().options?.loading"
                >
                  {{ button.text }}
                </app-button>
              }
              @case (ButtonRole.Ok) {
                <app-button
                  type="submit"
                  (click)="saveModal(button)"
                  [disabled]="modalService.modal().options?.loading"
                >
                  {{ button.text }}
                </app-button>
              }
              @case (ButtonRole.Reject) {
                <app-button
                  type="button"
                  (click)="saveModal(button)"
                  [disabled]="modalService.modal().options?.loading"
                >
                  {{ button.text }}
                </app-button>
              }
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent {
  protected readonly modalService = inject(ModalService);

  readonly adHost = viewChild(AdDirective);

  protected readonly ButtonRole = ButtonRoleEnum;
  protected readonly ModalInputType = ModalInputTypeEnum;
  public form: FormGroup = new FormGroup({});

  constructor() {
    effect(() => {
      const modalConfig = this.modalService.modal();
      if (modalConfig) {
        this.initializeForm(modalConfig);
        this.initializeDynamicComponents(modalConfig);
      }
    });
  }

  private initializeForm(modalConfig: ModalConfig): void {
    if (
      !Array.isArray(modalConfig.options?.inputs)
      || !modalConfig.options.inputs.length
    ) {
      this.form = new FormGroup({});
      return;
    }

    const group: { [key: string]: FormControl; } = {};

    modalConfig.options.inputs.forEach(input => {
      let initialValue = input.value;

      if (input.type === ModalInputTypeEnum.Checkbox) {
        initialValue = Boolean(input.value);
      }

      const control = new FormControl(
        initialValue,
        input.required ? Validators.required : undefined,
      );

      group[input.id] = control;

      control.valueChanges.subscribe(value => {
        const finalValue = input.type === ModalInputTypeEnum.Checkbox ? Boolean(value) : value;
        if (input.change) {
          input.change({
            ...this.form.value,
            [input.id]: finalValue,
          });
        }
      });
    });

    this.form = new FormGroup(group);
  }

  private initializeDynamicComponents(modalConfig: ModalConfig): void {
    const adHost = this.adHost();
    if (
      !adHost
      || !Array.isArray(modalConfig.options?.components)
      || !modalConfig.options.components.length
    ) {
      return;
    }

    const viewContainerRef = adHost.viewContainerRef;
    viewContainerRef.clear();

    modalConfig.options.components.forEach(component => {
      const componentRef = viewContainerRef.createComponent<any>(
        component.component,
      );
      Object.assign(componentRef.instance, component.data);
    });
  }

  protected getFormControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  protected closeModal(button: any): void {
    if (button.handler) {
      button.handler();
    }
    this.modalService.close();
  }

  protected closeModalIconHandler(): void {
    this.modalService.close();
  }

  protected async saveModal(button: any = null): Promise<void> {
    this.form.markAllAsTouched();

    if (this.form.valid) {
      if (button) {
        await this.handleButtonAction(button);
      } else {
        const modalConfig = this.modalService.modal();
        const saveButton = modalConfig.options?.buttons?.find(
          btn => btn.role === ButtonRoleEnum.Ok,
        );
        if (saveButton) {
          await this.handleButtonAction(saveButton);
        }
      }
    }
  }

  private async handleButtonAction(button: any): Promise<void> {
    const result = button.handler(this.form.value);

    if (result instanceof Promise) {
      const shouldClose = await result;
      if (shouldClose) {
        this.modalService.close();
      }
    } else if (result !== false) {
      this.modalService.close();
    }
  }
}
