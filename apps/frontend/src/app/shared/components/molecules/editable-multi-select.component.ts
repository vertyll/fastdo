import { Component, ViewEncapsulation, input, output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { LabelComponent } from '../atoms/label.component';

@Component({
  selector: 'app-editable-multi-select',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="space-y-2">
      <div class="relative">
        <ng-select
          [multiple]="multiple()"
          bindLabel="name"
          [searchable]="true"
          (change)="onSelectChange($event)"
          [(ngModel)]="selectValue"
          [maxSelectedItems]="maxSelectedItems()"
          [id]="id()"
          notFoundText="{{ 'Basic.noItemsFound' | translate }}"
          (search)="onSelectSearch($event)"
          [minTermLength]="minTermLength()"
          [addTag]="false"
          [appendTo]="'body'"
          [closeOnSelect]="false"
          [hideSelected]="false"
          [selectableGroup]="true"
          [typeToSearchText]="'Basic.typeToSearch' | translate"
          [loadingText]="'Basic.loading' | translate"
          class="bg-background-secondary dark:bg-dark-background-secondary dark:text-dark-text-primary transition-colors duration-200 block w-full text-sm text-text-primary rounded-lg border border-border-primary dark:border-dark-border-primary appearance-none focus:outline-none focus:ring-0 focus:border-primary-600 dark:focus:border-primary-500 peer"
        >
          @for (item of normalizedDataArray; track $index) {
            <ng-option [value]="item.id">
              {{ item.name }}
            </ng-option>
          }
        </ng-select>
        <app-label [forId]="id()" [isField]="true">{{ placeholder() }}</app-label>
      </div>
    </div>
  `,
  styles: `
    /* Base styles for the ng-select component */
    .ng-select {
      position: relative;
      display: block;
      box-sizing: border-box;
      min-height: 3rem;
    }

    .ng-select .ng-select-container {
      display: flex;
      align-items: center;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 0.5rem;
      background: transparent;
      border: none;
      outline: none;
      position: relative;
      min-height: 3rem;
      height: 3rem;
    }

    .ng-select .ng-input {
      padding-left: 0.75rem;
      padding-right: 3rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: rgb(17 24 39);
      background-color: transparent;
      border: none;
      outline: none;
      display: flex;
      align-items: center;
      height: 100%;
    }

    :host-context(.dark) .ng-select .ng-input {
      color: rgb(249 250 251);
    }

    .ng-select .ng-input::placeholder {
      color: rgb(156 163 175);
    }

    :host-context(.dark) .ng-select .ng-input::placeholder {
      color: rgb(156 163 175);
    }

    /* Focused state */
    .ng-select.ng-select-focused {
      box-shadow: 0 0 0 0 transparent;
    }

    :host-context(.dark) .ng-select.ng-select-focused .ng-select-container {
      border-color: rgb(249 115 22);
    }

    /* Dropdown panel */
    .ng-dropdown-panel {
      background-color: rgb(255 255 255);
      border: 1px solid rgb(229 231 235);
      border-radius: 0.75rem;
      box-shadow:
        0 10px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
      margin-top: 0.25rem;
      min-width: 100%;
      z-index: 1000;
      left: 0;
      top: 100%;
      max-height: 16rem;
      overflow-y: auto;
      padding: 0.5rem;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    :host-context(.dark) .ng-dropdown-panel {
      background-color: rgb(55 65 81);
      border-color: rgb(75 85 99);
      box-shadow:
        0 10px 25px -5px rgba(0, 0, 0, 0.3),
        0 10px 10px -5px rgba(0, 0, 0, 0.2);
    }

    /* Dropdown options */
    .ng-option {
      padding: 0.75rem 1rem;
      color: rgb(107 114 128);
      font-size: 0.875rem;
      line-height: 1.25rem;
      cursor: pointer;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 0.5rem;
      margin-bottom: 0.125rem;
      display: flex;
      align-items: center;
      position: relative;
      font-weight: 500;
    }

    :host-context(.dark) .ng-option {
      color: rgb(209 213 219);
    }

    .ng-option:hover,
    .ng-option.ng-option-highlighted {
      background-color: rgb(249 250 251);
      color: rgb(17 24 39);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1);
    }

    :host-context(.dark) .ng-option:hover,
    :host-context(.dark) .ng-option.ng-option-highlighted {
      background-color: rgb(75 85 99);
      color: rgb(249 250 251);
    }

    .ng-option.ng-option-selected {
      background: linear-gradient(135deg, rgb(249 115 22), rgb(234 88 12));
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 4px 12px -2px rgba(249, 115, 22, 0.4);
    }

    .ng-option.ng-option-selected::after {
      content: '✓';
      position: absolute;
      right: 1rem;
      font-weight: bold;
      color: #ffffff;
    }

    :host-context(.dark) .ng-option.ng-option-selected {
      background: linear-gradient(135deg, rgb(249 115 22), rgb(234 88 12));
      color: #ffffff;
      box-shadow: 0 4px 12px -2px rgba(249, 115, 22, 0.6);
    }

    .ng-option.ng-option-disabled {
      color: rgb(156 163 175);
      cursor: not-allowed;
      opacity: 0.5;
    }

    /* Placeholder */
    .ng-placeholder {
      color: rgb(156 163 175);
      font-size: 0.875rem;
      padding: 0.75rem;
      line-height: 1.5;
      font-weight: 400;
    }

    /* Dropdown arrow */
    .ng-arrow-wrapper {
      width: 1.5rem;
      padding-right: 0.375rem;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      right: 0.25rem;
      top: 3%;
      height: 1.5rem;
      z-index: 10;
    }

    @media (max-width: 640px) {
      .ng-arrow-wrapper {
        width: 1.25rem;
        right: 0.125rem;
      }
    }

    .ng-arrow-wrapper .ng-arrow {
      border-color: rgb(107 114 128) transparent transparent;
      border-style: solid;
      border-width: 5px 5px 0;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @media (max-width: 640px) {
      .ng-arrow-wrapper .ng-arrow {
        border-width: 4px 4px 0;
      }
    }

    :host-context(.dark) .ng-arrow-wrapper .ng-arrow {
      border-color: rgb(156 163 175) transparent transparent;
    }

    .ng-select.ng-select-focused .ng-arrow-wrapper .ng-arrow {
      border-color: rgb(249 115 22) transparent transparent;
      transform: rotate(-180deg);
    }

    .ng-select.ng-select-opened .ng-arrow-wrapper .ng-arrow {
      border-color: transparent transparent rgb(249 115 22);
      border-width: 0 5px 5px;
      transform: rotate(0deg);
    }

    @media (max-width: 640px) {
      .ng-select.ng-select-opened .ng-arrow-wrapper .ng-arrow {
        border-width: 0 4px 4px;
      }
    }

    /* Clear all button */
    .ng-clear-wrapper {
      color: rgb(107 114 128);
      cursor: pointer;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 9999px;
      position: absolute;
      right: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    @media (max-width: 640px) {
      .ng-clear-wrapper {
        width: 1.25rem;
        height: 1.25rem;
        right: 1.5rem;
      }
    }

    .ng-clear-wrapper:hover {
      color: rgb(239 68 68);
      background-color: rgba(239, 68, 68, 0.1);
    }

    /* Tags (for multiple select) */
    .ng-value-container {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.15rem;
      padding-left: 0.75rem;
      min-height: 3rem;
      box-sizing: border-box;
      width: 100%;
      overflow: hidden;
    }

    @media (max-width: 640px) {
      .ng-value-container {
        padding: 0 2.5rem 0 0.5rem;
        min-height: 3.5rem;
        gap: 0.125rem;
      }
    }

    .ng-value {
      background: linear-gradient(135deg, rgb(254 215 170), rgb(253 186 116));
      color: rgb(154 52 18);
      padding: 0.15rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      border: 1px solid rgb(253 186 116);
      transition: all 0.2s ease;
      white-space: nowrap;
      flex-shrink: 0;
      max-height: 2rem;
      line-height: 1;
      margin-right: 0.25rem;
    }

    @media (max-width: 640px) {
      .ng-value {
        font-size: 0.6875rem;
        padding: 0.125rem 0.25rem;
        max-height: 1.5rem;
        border-radius: 0.25rem;
      }
    }

    @media (max-width: 480px) {
      .ng-value {
        font-size: 0.625rem;
        padding: 0.125rem 0.25rem;
        max-height: 1.25rem;
        gap: 0.125rem;
      }
    }

    @media (max-width: 640px) {
      .ng-value:hover {
        transform: none;
        box-shadow: none;
      }
    }

    /* X button for removing tags */
    .ng-value-icon {
      cursor: pointer;
      font-weight: bold;
      color: rgb(249 115 22);
      transition: color 0.2s ease;
      width: 18px;
      height: 18px;
      min-width: 18px;
      min-height: 18px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      margin-left: 0.25rem;
      font-size: 12px;
      line-height: 1;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
    }

    @media (max-width: 640px) {
      .ng-value-icon {
        width: 16px;
        height: 16px;
        min-width: 16px;
        min-height: 16px;
        font-size: 10px;
        margin-left: 0.125rem;
      }
    }

    @media (max-width: 480px) {
      .ng-value-icon {
        width: 14px;
        height: 14px;
        min-width: 14px;
        min-height: 14px;
        font-size: 9px;
        margin-left: 0.0625rem;
      }
    }

    .ng-value-icon:hover {
      color: rgb(239 68 68);
      background: rgba(239, 68, 68, 0.2);
      transform: scale(1.1);
    }

    @media (max-width: 640px) {
      .ng-value-icon:hover {
        transform: none;
      }
    }

    /* Scrollbar for dropdown panel */
    .ng-dropdown-panel::-webkit-scrollbar {
      width: 6px;
    }

    .ng-dropdown-panel::-webkit-scrollbar-track {
      background: rgb(249 250 251);
      border-radius: 3px;
    }

    :host-context(.dark) .ng-dropdown-panel::-webkit-scrollbar-track {
      background: rgb(75 85 99);
    }

    .ng-dropdown-panel::-webkit-scrollbar-thumb {
      background: rgb(251 146 60);
      border-radius: 3px;
    }

    .ng-dropdown-panel::-webkit-scrollbar-thumb:hover {
      background: rgb(249 115 22);
    }

    /* Animatiosn for dropdown panel */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .ng-dropdown-panel {
      animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @media (max-width: 375px) {
      .ng-value-container {
        padding-left: 0.375rem;
        padding-right: 2rem;
        min-height: 3rem;
      }
      .ng-select .ng-input {
        min-height: 3rem;
        padding-left: 0.375rem;
        padding-right: 2rem;
      }
      .ng-select .ng-select-container {
        min-height: 3rem;
      }
    }
  `,
  imports: [NgSelectComponent, TranslateModule, FormsModule, NgSelectModule, LabelComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: EditableMultiSelectComponent,
    },
  ],
})
export class EditableMultiSelectComponent implements ControlValueAccessor, Validators {
  readonly dataArray = input.required<any[]>();
  readonly maxSelectedItems = input<number | undefined>(undefined);
  readonly multiple = input<boolean>(true);
  readonly id = input.required<string>();
  readonly minTermLength = input<number>(0);
  readonly allowAddTag = input<boolean>(true);
  readonly placeholder = input<string>('');

  readonly searched = output();

  protected selectValue: any;

  private touched = false;

  private onChange = (_value: any): void => {};
  private onTouched = (): void => {};

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private markAsTouched(): void {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  public registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  public writeValue(value: any): void {
    this.selectValue = value;
  }

  protected onSelectChange(inputValue: any): void {
    this.markAsTouched();
    this.selectValue = inputValue;
    this.onChange(this.selectValue);
  }

  protected onSelectSearch(event: any): void {
    this.searched.emit(event);
  }

  get normalizedDataArray(): Array<{ id: any; name: string }> {
    return (this.dataArray() ?? []).map(item => {
      if (typeof item === 'number' || typeof item === 'string') {
        return { id: item, name: String(item) };
      }
      if (typeof item.name !== 'string') {
        return { ...item, name: String(item.name) };
      }
      return item;
    });
  }
}
