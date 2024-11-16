import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  HostListener,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LabelComponent } from '../atoms/label.component';

@Component({
  selector: 'app-check-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LabelComponent],
  template: `
    <div class="relative">
      <div
        [id]="id"
        (click)="toggleDropdown()"
        class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer cursor-pointer"
      >
        <span>{{ label }}</span>
        @if (isDropdownOpen) {
          <div
            (click)="$event.stopPropagation()"
            class="absolute bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg mt-1 w-full z-10"
          >
            @for (option of translatedOptions; track $index) {
              <div class="flex items-center p-2">
                <input
                  type="checkbox"
                  [id]="option.value"
                  [value]="option.value"
                  (change)="onCheckboxChange($event)"
                  [checked]="isChecked(option.value)"
                  class="form-check-input h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  [for]="option.value"
                  class="ml-2 text-sm text-gray-900 dark:text-gray-300"
                >
                  {{ option.label }}
                </label>
              </div>
            }
          </div>
        }
      </div>
      <app-label [forId]="id">{{ label }}</app-label>
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
  @Input() control!: FormControl;
  @Input() id!: string;
  @Input() label!: string;
  @Input() options: Array<{ value: any; label: string }> = [];

  protected translatedOptions: Array<{ value: any; label: string }> = [];
  protected isDropdownOpen = false;

  private langChangeSubscription!: Subscription;

  constructor(private readonly translateService: TranslateService) {}

  ngOnInit(): void {
    this.translateOptions();
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      (event: LangChangeEvent) => {
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
      !event.target ||
      !(event.target as HTMLElement).closest('.form-select')
    ) {
      this.isDropdownOpen = false;
    }
  }

  protected onCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;
    const currentValue = this.control.value
      ? this.control.value.split(',')
      : [];

    if (checkbox.checked) {
      this.control.setValue([...currentValue, value].join(','));
    } else {
      this.control.setValue(
        currentValue.filter((v: any) => v !== value).join(','),
      );
    }
  }

  protected isChecked(value: any): boolean {
    const currentValue = this.control.value
      ? this.control.value.split(',')
      : [];
    return currentValue.includes(value);
  }

  protected toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  private translateOptions(): void {
    this.translatedOptions = this.options.map((option) => ({
      value: option.value,
      label: this.translateService.instant(option.label),
    }));
  }
}
