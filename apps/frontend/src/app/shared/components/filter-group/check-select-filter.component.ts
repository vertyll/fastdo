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

@Component({
  selector: 'app-check-select-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <div [id]="id" (click)="toggleDropdown()">
        <span>{{ label }}</span>
        @if (isDropdownOpen) {
          <div (click)="$event.stopPropagation()">
            @for (option of translatedOptions; track $index) {
              <div>
                <input
                  type="checkbox"
                  [id]="option.value"
                  [value]="option.value"
                  (change)="onCheckboxChange($event)"
                  [checked]="isChecked(option.value)"
                />
                <label [for]="option.value">
                  {{ option.label }}
                </label>
              </div>
            }
          </div>
        }
      </div>
      <label [for]="id">{{ label }}</label>
    </div>
  `,
  styles: [
    `
      .form-select {
        border: 1px solid #ced4da;
        border-radius: 0.25rem;
        padding: 0.375rem 0.75rem;
        height: auto;
        cursor: pointer;
        position: relative;
      }

      .dropdown-content {
        display: block;
        position: absolute;
        background-color: #f9f9f9;
        min-width: 100%;
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
        z-index: 2;
      }

      .form-check {
        display: flex;
        align-items: center;
        margin-left: 0.5rem;
      }

      .form-check-input {
        margin-right: 0.5rem;
      }
    `,
  ],
})
export class CheckSelectFilterComponent implements OnInit, OnDestroy {
  @Input()
  control!: FormControl;
  @Input()
  id!: string;
  @Input()
  label!: string;
  @Input()
  options: Array<{ value: any; label: string }> = [];

  translatedOptions: Array<{ value: any; label: string }> = [];
  private langChangeSubscription!: Subscription;
  isDropdownOpen = false;

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

  private translateOptions(): void {
    this.translatedOptions = this.options.map((option) => ({
      value: option.value,
      label: this.translateService.instant(option.label),
    }));
  }

  onCheckboxChange(event: Event): void {
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

  isChecked(value: any): boolean {
    const currentValue = this.control.value
      ? this.control.value.split(',')
      : [];
    return currentValue.includes(value);
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
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
}
