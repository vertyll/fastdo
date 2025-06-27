import { Component, HostListener, OnDestroy, OnInit, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LabelComponent } from '../atoms/label.component';

@Component({
  selector: 'app-check-select',
  imports: [ReactiveFormsModule, LabelComponent],
  template: `
    <div class="relative">
      <div
        [id]="id()"
        (click)="toggleDropdown()"
        class="dark:bg-dark-background-primary dark:text-dark-text-primary transition-colors duration-transitionDuration-200 block px-2.5 pb-2.5 pt-4 w-full text-sm text-text-primary bg-transparent rounded-borderRadius-lg border border-border-primary dark:border-dark-border-primary appearance-none focus:outline-none focus:ring-0 focus:border-primary-500 dark:focus:border-primary-400 peer cursor-pointer"
      >
        <span>{{ label() }}</span>
        @if (isDropdownOpen) {
          <div
            (click)="$event.stopPropagation()"
            class="absolute bg-background-primary dark:bg-dark-background-primary border border-border-primary dark:border-dark-border-primary rounded-borderRadius-lg mt-1 w-full z-10"
          >
            @for (option of translatedOptions; track $index) {
              <div class="flex items-center p-spacing-2">
                <input
                  type="checkbox"
                  [id]="option.value"
                  [value]="option.value"
                  (change)="onCheckboxChange($event)"
                  [checked]="isChecked(option.value)"
                  class="form-check-input h-4 w-4 text-primary-500 border-border-primary dark:border-dark-border-primary rounded focus:ring-primary-200 dark:focus:ring-primary-800 focus:ring-2"
                />
                <app-label [forId]="option.value">
                  {{ option.label }}
                </app-label>
              </div>
            }
          </div>
        }
      </div>
      <app-label [forId]="id()" [isField]="true">{{ label() }}</app-label>
    </div>
  `,
  styles: [
    `
      .form-check-input {
        margin-right: 0.5rem;
      }
    `,
  ],
})
export class CheckSelectComponent implements OnInit, OnDestroy {
  private readonly translateService = inject(TranslateService);

  readonly control = input.required<FormControl>();
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly options = input<
    Array<{
      value: any;
      label: string;
    }>
  >([]);

  protected translatedOptions: Array<{ value: any; label: string; }> = [];
  protected isDropdownOpen = false;

  private langChangeSubscription!: Subscription;

  ngOnInit(): void {
    this.translateOptions();
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      (_event: LangChangeEvent) => {
        this.translateOptions();
      },
    );
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (
      !event.target
      || !(event.target as HTMLElement).closest('.form-select')
    ) {
      this.isDropdownOpen = false;
    }
  }

  protected onCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;
    const control = this.control();
    const currentValue = control.value
      ? control.value.split(',')
      : [];

    if (checkbox.checked) {
      this.control().setValue([...currentValue, value].join(','));
    } else {
      this.control().setValue(
        currentValue.filter((v: any) => v !== value).join(','),
      );
    }
  }

  protected isChecked(value: any): boolean {
    const control = this.control();
    const currentValue = control.value
      ? control.value.split(',')
      : [];
    return currentValue.includes(value);
  }

  protected toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  private translateOptions(): void {
    this.translatedOptions = this.options().map(option => ({
      value: option.value,
      label: this.translateService.instant(option.label),
    }));
  }
}
