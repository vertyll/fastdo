import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal.service';
import { ModalConfig } from '../../interfaces/modal.interface';
import { SpinnerComponent } from '../atoms/spinner.component';
import { ErrorMessageComponent } from '../atoms/error.message.component';
import { InputInvalidPipe } from '../../pipes/input-invalid.pipe';
import { CheckboxComponent } from '../atoms/checkbox.component';
import { InputComponent } from '../atoms/input.component';
import { ButtonComponent } from '../atoms/button.component';
import { TextareaComponent } from '../atoms/textarea-component';
import { heroXMarkSolid } from '@ng-icons/heroicons/solid';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { AdDirective } from 'src/app/core/directives/ad.directive';

@Component({
  selector: 'app-modal',
  standalone: true,
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
  ],
  viewProviders: [provideIcons({ heroXMarkSolid })],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      tabindex="-1"
      role="dialog"
      [ngStyle]="{ display: config?.visible ? 'flex' : 'none' }"
      data-keyboard="true"
    >
      <div
        class="w-full max-w-lg bg-white rounded-lg shadow-lg"
        role="document"
      >
        <div class="px-6 py-4 border-b flex justify-between items-center">
          <h4 class="text-xl font-semibold">{{ config?.options?.title }}</h4>
          <button (click)="closeModalIconHandler()" aria-label="Close">
            <ng-icon
              name="heroXMarkSolid"
              class="w-6 h-6 text-gray-500 hover:text-gray-700"
            ></ng-icon>
          </button>
        </div>

        <div class="px-6 py-4">
          @if (config?.options?.loading) {
            <div class="flex justify-center py-4">
              <app-spinner />
            </div>
          }

          @if (config?.options?.message) {
            <p [innerHTML]="config?.options?.message" class="mb-4"></p>
          }

          <ng-container adHost></ng-container>

          @if (config?.options?.inputs?.length && form) {
            <form [formGroup]="form" (ngSubmit)="saveModal()" #formElement>
              @for (input of config?.options?.inputs; track input.id) {
                @if (input.message) {
                  <p [innerHTML]="input.message" class="mt-3 mb-2"></p>
                }

                <div class="mb-4" [ngClass]="form.get(input.id) | inputInvalid">
                  <div
                    [ngClass]="{
                      'flex items-center': input.type === 'checkbox',
                      block: input.type !== 'checkbox',
                    }"
                  >
                    @if (input.label) {
                      <label
                        [for]="input.id"
                        class="text-sm text-gray-700 dark:text-gray-300"
                      >
                        {{ input.label }}
                      </label>
                    }
                    @switch (input.type) {
                      @case ('checkbox') {
                        <app-checkbox
                          [id]="input.id"
                          [checked]="input.value"
                          [control]="getFormControl(input.id)"
                          class="mr-3"
                        />
                      }
                      @case ('textarea') {
                        <app-textarea
                          [id]="input.id"
                          [control]="getFormControl(input.id)"
                          [rows]="3"
                          class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      }
                      @case ('date') {
                        <app-input
                          [id]="input.id"
                          type="date"
                          [control]="getFormControl(input.id)"
                          class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      }
                      @case ('datetime-local') {
                        <app-input
                          [id]="input.id"
                          type="datetime-local"
                          [control]="getFormControl(input.id)"
                          class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      }
                      @case ('number') {
                        <app-input
                          [id]="input.id"
                          type="number"
                          [control]="getFormControl(input.id)"
                          class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      }
                      @default {
                        <app-input
                          [id]="input.id"
                          [type]="'text'"
                          [control]="getFormControl(input.id)"
                          class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      }
                    }
                  </div>

                  <app-error-message [input]="form.get(input.id)" />
                </div>
              }

              @if (config?.options?.error) {
                <div
                  class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                >
                  {{ config?.options?.error }}
                </div>
              }
            </form>
          }
        </div>

        <div class="px-6 py-4 border-t flex justify-end space-x-2">
          @for (button of config?.options?.buttons; track button.role) {
            @switch (button.role) {
              @case ('cancel') {
                <app-button
                  (click)="closeModal(button)"
                  [disabled]="config?.options?.loading"
                >
                  {{ button.text }}
                </app-button>
              }
              @case ('ok') {
                <app-button
                  type="submit"
                  (click)="saveModal(button)"
                  [disabled]="config?.options?.loading"
                >
                  {{ button.text }}
                </app-button>
              }
              @case ('reject') {
                <app-button
                  type="button"
                  (click)="saveModal(button)"
                  [disabled]="config?.options?.loading"
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
export class ModalComponent implements OnInit, OnDestroy {
  @ViewChild(AdDirective, { static: false }) adHost!: AdDirective;
  @ViewChild('formElement') formElement!: ElementRef;

  public config: ModalConfig | null = null;
  public form!: FormGroup;
  private subscription = new Subscription();

  constructor(
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.modalService.modal$.subscribe((modalConfig) => {
        this.config = modalConfig;
        this.initializeForm();
        this.initializeDynamicComponents();
        this.cdr.detectChanges();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initializeForm(): void {
    if (
      !Array.isArray(this.config?.options?.inputs) ||
      !this.config.options.inputs.length
    ) {
      this.form = new FormGroup({});
      return;
    }

    const group: { [key: string]: FormControl } = {};

    this.config.options.inputs.forEach((input) => {
      const control = new FormControl(
        input.value || '',
        input.required ? Validators.required : undefined,
      );

      group[input.id] = control;

      this.subscription.add(
        control.valueChanges.subscribe((value) => {
          input.value = value;
          if (input.change) {
            input.change({
              ...this.form.value,
              [input.id]: value,
            });
          }
        }),
      );
    });

    this.form = new FormGroup(group);
  }

  private initializeDynamicComponents(): void {
    if (
      !this.adHost ||
      !Array.isArray(this.config?.options?.components) ||
      !this.config.options.components.length
    )
      return;

    const viewContainerRef = this.adHost.viewContainerRef;
    viewContainerRef.clear();

    this.config.options.components.forEach((component) => {
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
        const saveButton = this.config?.options?.buttons?.find(
          (btn) => btn.role === 'ok',
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
