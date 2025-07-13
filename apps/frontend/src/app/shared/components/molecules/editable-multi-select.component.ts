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
          class="bg-background-secondary dark:bg-dark-background-secondary dark:text-dark-text-primary transition-colors duration-200 block  w-full text-sm text-text-primary rounded-lg border border-border-primary dark:border-dark-border-primary appearance-none focus:outline-none focus:ring-0 focus:border-primary-600 dark:focus:border-primary-500 peer"
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
    /* Główny kontener ng-select */
    .ng-select {
      position: relative;
      display: block;
      box-sizing: border-box;
    }
    
    .ng-select .ng-select-container {
      display: flex;
      align-items: flex-start;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 0.5rem;
      background: transparent;
      border: none;
      outline: none;
      position: relative;
    }

    .ng-select .ng-input {
      @apply pl-3 pr-12 text-sm leading-5 text-text-primary bg-transparent border-none outline-none flex items-center;
    }

    /* Responsywne ustawienia dla małych ekranów */
    @media (max-width: 640px) {
      .ng-select .ng-select-container {
        min-height: 3rem;
      }
      .ng-select .ng-input {
        min-height: 3rem;
        @apply pl-2 pr-10 text-[0.8125rem];
      }
    }

    :host-context(.dark) .ng-select .ng-input {
      color: var(--dark-text-primary, rgb(249 250 251));
    }

    .ng-select .ng-input::placeholder {
      color: var(--text-secondary, rgb(156 163 175));
    }

    :host-context(.dark) .ng-select .ng-input::placeholder {
      color: var(--dark-text-secondary, rgb(156 163 175));
    }

    /* Fokus styling */
    .ng-select.ng-select-focused {
      box-shadow: 0 0 0 0 transparent;
    }

    :host-context(.dark) .ng-select.ng-select-focused .ng-select-container {
      border-color: var(--primary-500, rgb(249 115 22));
    }

    /* Panel dropdown */
    .ng-dropdown-panel {
      background-color: var(--background-secondary, rgb(255 255 255));
      border: 1px solid var(--border-primary, rgb(229 231 235));
      border-radius: 0.75rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
      background-color: var(--dark-background-secondary, rgb(55 65 81));
      border-color: var(--dark-border-primary, rgb(75 85 99));
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
    }

    /* Opcje w dropdown */
    .ng-option {
      padding: 0.75rem 1rem;
      color: var(--text-secondary, rgb(107 114 128));
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
      color: var(--dark-text-secondary, rgb(209 213 219));
    }

    .ng-option:hover,
    .ng-option.ng-option-highlighted {
      background-color: var(--background-primary, rgb(249 250 251));
      color: var(--text-primary, rgb(17 24 39));
      transform: translateY(-1px);
      box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1);
    }

    :host-context(.dark) .ng-option:hover,
    :host-context(.dark) .ng-option.ng-option-highlighted {
      background-color: var(--dark-background-primary, rgb(75 85 99));
      color: var(--dark-text-primary, rgb(249 250 251));
    }

    .ng-option.ng-option-selected {
      background: linear-gradient(135deg, var(--primary-600, rgb(249 115 22)), var(--primary-700, rgb(234 88 12)));
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
      background: linear-gradient(135deg, var(--primary-600, rgb(249 115 22)), var(--primary-700, rgb(234 88 12)));
      color: #ffffff;
      box-shadow: 0 4px 12px -2px rgba(249, 115, 22, 0.6);
    }

    .ng-option.ng-option-disabled {
      color: var(--text-disabled, rgb(156 163 175));
      cursor: not-allowed;
      opacity: 0.5;
    }

    :host-context(.dark) .ng-option.ng-option-disabled {
      color: var(--dark-text-disabled, rgb(156 163 175));
    }

    /* Placeholder */
    .ng-placeholder {
      color: var(--text-secondary, rgb(156 163 175));
      font-size: 0.875rem;
      padding: 0.75rem;
      line-height: 1.5;
      font-weight: 400;
    }

    :host-context(.dark) .ng-placeholder {
      color: var(--dark-text-secondary, rgb(156 163 175));
    }

    /* Strzałka dropdown */
    .ng-arrow-wrapper {
      @apply w-6 pr-1.5 flex items-center justify-center absolute right-1 h-6 z-10;
      top: 50%;
      transform: translateY(-50%);
    }

    @media (max-width: 640px) {
      .ng-arrow-wrapper {
        @apply w-5 right-0.5;
      }
    }

    .ng-arrow-wrapper .ng-arrow {
      border-color: var(--text-secondary, rgb(107 114 128)) transparent transparent;
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
      border-color: var(--dark-text-secondary, rgb(156 163 175)) transparent transparent;
    }

    .ng-select.ng-select-focused .ng-arrow-wrapper .ng-arrow {
      border-color: var(--primary-600, rgb(249 115 22)) transparent transparent;
      transform: rotate(-180deg);
    }

    .ng-select.ng-select-opened .ng-arrow-wrapper .ng-arrow {
      border-color: transparent transparent var(--primary-600, rgb(249 115 22));
      border-width: 0 5px 5px;
      transform: rotate(0deg);
    }

    @media (max-width: 640px) {
      .ng-select.ng-select-opened .ng-arrow-wrapper .ng-arrow {
        border-width: 0 4px 4px;
      }
    }

    /* Przycisk czyszczenia */
    .ng-clear-wrapper {
      color: var(--text-secondary, rgb(107 114 128));
      cursor: pointer;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      @apply w-6 h-6 rounded-full absolute right-7 flex items-center justify-center z-10;
      top: 50%;
      transform: translateY(-50%);
    }

    @media (max-width: 640px) {
      .ng-clear-wrapper {
        @apply w-5 h-5 right-6;
      }
    }

    .ng-clear-wrapper:hover {
      color: var(--danger-600, rgb(239 68 68));
      background-color: rgba(239, 68, 68, 0.1);
      transform: translateY(-50%) scale(1.1);
    }

    :host-context(.dark) .ng-clear-wrapper {
      color: var(--dark-text-secondary, rgb(156 163 175));
    }

    :host-context(.dark) .ng-clear-wrapper:hover {
      color: var(--danger-600, rgb(239 68 68));
      background-color: rgba(239, 68, 68, 0.2);
    }

    /* Tagi (dla multi-select) - responsywne ustawienia */
    .ng-value-container {
      @apply flex flex-wrap items-center gap-1 px-3 pr-12 py-3 min-h-[2.5rem] box-border w-full;
    }

    @media (max-width: 640px) {
      .ng-value-container {
        @apply px-2 pr-10 py-2 min-h-[3rem] gap-[0.125rem];
      }
    }

    .ng-value {
      background: linear-gradient(135deg, var(--primary-100, rgb(254 215 170)), var(--primary-200, rgb(253 186 116)));
      color: var(--primary-800, rgb(154 52 18));
      @apply px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 border border-primary-300 transition whitespace-nowrap flex-shrink-0 max-h-8 leading-none;
    }

    @media (max-width: 640px) {
      .ng-value {
        @apply text-[0.6875rem] px-1 py-[0.125rem] max-h-6 rounded;
      }
    }

    @media (max-width: 480px) {
      .ng-value {
        @apply text-[0.625rem] px-1 py-[0.125rem] max-h-5 gap-[0.125rem];
      }
    }

    :host-context(.dark) .ng-value {
      background: linear-gradient(135deg, var(--primary-900, rgb(124 45 18)), var(--primary-800, rgb(154 52 18)));
      color: var(--primary-200, rgb(253 186 116));
      border-color: var(--primary-700, rgb(194 65 12));
    }

    .ng-value:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px -2px rgba(249, 115, 22, 0.3);
    }

    @media (max-width: 640px) {
      .ng-value:hover {
        transform: none; /* Usunięcie hover efektu na małych ekranach */
        box-shadow: none;
      }
    }

    /* POPRAWIONY PRZYCISK X W TAGACH */
    .ng-value-icon {
      @apply cursor-pointer font-bold text-primary-600 transition-colors hover:text-danger-600 flex items-center justify-center;
      width: 16px !important;
      height: 16px !important;
      min-width: 16px !important;
      min-height: 16px !important;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      margin-left: 4px;
      font-size: 12px;
      line-height: 1;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media (max-width: 640px) {
      .ng-value-icon {
        width: 14px !important;
        height: 14px !important;
        min-width: 14px !important;
        min-height: 14px !important;
        font-size: 10px;
        margin-left: 2px;
      }
    }

    @media (max-width: 480px) {
      .ng-value-icon {
        width: 12px !important;
        height: 12px !important;
        min-width: 12px !important;
        min-height: 12px !important;
        font-size: 9px;
        margin-left: 1px;
      }
    }

    .ng-value-icon:hover {
      color: var(--danger-600, rgb(239 68 68)) !important;
      background: rgba(239, 68, 68, 0.2);
      transform: scale(1.1);
    }

    @media (max-width: 640px) {
      .ng-value-icon:hover {
        transform: none;
      }
    }

    :host-context(.dark) .ng-value-icon {
      background: rgba(0, 0, 0, 0.2);
      color: var(--primary-300, rgb(253 186 116));
    }

    :host-context(.dark) .ng-value-icon:hover {
      color: var(--danger-400, rgb(248 113 113)) !important;
      background: rgba(239, 68, 68, 0.3);
    }

    /* Usunięcie wskaźnika "..." - nie potrzebny przy flex-wrap */
    .ng-value-container::after {
      display: none;
    }

    /* Scrollbar dla dropdown */
    .ng-dropdown-panel::-webkit-scrollbar {
      width: 6px;
    }

    .ng-dropdown-panel::-webkit-scrollbar-track {
      background: var(--background-primary, rgb(249 250 251));
      border-radius: 3px;
    }

    :host-context(.dark) .ng-dropdown-panel::-webkit-scrollbar-track {
      background: var(--dark-background-primary, rgb(75 85 99));
    }

    .ng-dropdown-panel::-webkit-scrollbar-thumb {
      background: var(--primary-400, rgb(251 146 60));
      border-radius: 3px;
    }

    .ng-dropdown-panel::-webkit-scrollbar-thumb:hover {
      background: var(--primary-500, rgb(249 115 22));
    }

    /* Animacje */
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

    /* Responsywność dla dropdown */
    @media (max-width: 640px) {
      .ng-dropdown-panel {
        max-height: 12rem;
        margin-top: 0.125rem;
        padding: 0.25rem;
        border-radius: 0.5rem;
      }
      
      .ng-option {
        padding: 0.5rem 0.75rem;
        font-size: 0.8125rem;
        margin-bottom: 0.0625rem;
      }
    }

    @media (max-width: 480px) {
      .ng-dropdown-panel {
        max-height: 10rem;
        padding: 0.125rem;
      }
      
      .ng-option {
        padding: 0.375rem 0.5rem;
        font-size: 0.75rem;
        border-radius: 0.375rem;
      }
    }

    /* Dodatkowe pozycjonowanie dla kontenerów ng-select */
    .ng-select .ng-select-container {
      position: relative;
      min-height: 2.5rem;
    }

    .ng-select.ng-select-multiple .ng-select-container {
      min-height: 2.5rem;
    }

    /* Upewniamy się, że przyciski są zawsze wycentrowane względem kontenera */
    .ng-select .ng-arrow-wrapper,
    .ng-select .ng-clear-wrapper {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }

    .ng-select .ng-clear-wrapper:hover {
      transform: translateY(-50%) scale(1.1);
    }
    @media (max-width: 375px) {
      .ng-value-container {
        @apply px-1.5 pr-8 min-h-[2.5rem];
      }
      .ng-select .ng-input {
        @apply min-h-[2.5rem] pl-1.5 pr-8;
      }
      .ng-select .ng-select-container {
        @apply min-h-[2.5rem];
      }
    }
  `,
  imports: [
    NgSelectComponent,
    TranslateModule,
    FormsModule,
    NgSelectModule,
    LabelComponent,
  ],
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

  readonly onSearch = output();

  protected selectValue: any;

  private touched = false;

  private onChange = (_value: any) => {
  };

  private onTouched = () => {};

  public registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  private markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  public registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  public writeValue(value: any) {
    this.selectValue = value;
  }

  protected onSelectChange(inputValue: any) {
    this.markAsTouched();
    this.selectValue = inputValue;
    this.onChange(this.selectValue);
  }

  protected onSelectSearch(event: any) {
    this.onSearch.emit(event);
  }

  get normalizedDataArray() {
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
