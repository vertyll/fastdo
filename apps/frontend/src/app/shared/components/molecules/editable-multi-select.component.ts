import { Component, OnChanges, ViewEncapsulation, input, output } from '@angular/core';
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
          [addTag]="allowAddTag() ? addTag : false"
          [addTagText]="
            allowAddTag() ? ('EditableMultiSelect.addTagsAdHoc' | translate) : null
          "
          class="bg-background-secondary dark:bg-dark-background-secondary dark:text-dark-text-primary transition-colors duration-transitionDuration-200 block px-2.5 pb-2.5 pt-4 w-full text-sm text-text-primary rounded-lg border border-border-primary dark:border-dark-border-primary appearance-none focus:outline-none focus:ring-0 focus:border-primary-600 dark:focus:border-primary-500 peer"
        >
          @for (item of dataArray(); track $index) {
            <ng-option [value]="item.id">
              {{ item.name }}
            </ng-option>
          }
        </ng-select>
        <app-label [forId]="id()" [isField]="true">{{ placeholder() }}</app-label>
      </div>
      
      @if (selectedItems && selectedItems.length > 0) {
        <div class="flex flex-wrap gap-1.5 p-2 bg-background-secondary dark:bg-dark-background-secondary rounded-lg border border-border-primary dark:border-dark-border-primary">
          @for (item of selectedItems; track item.id) {
            <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-700 bg-primary-50 dark:text-primary-300 dark:bg-primary-900/30 rounded-md">
              {{ item.name }}
              <button
                type="button"
                (click)="removeItem(item.id)"
                class="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </span>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .ng-dropdown-panel {
      background-color: rgb(255 255 255);
      border: 1px solid rgb(229 231 235);
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
      margin-top: 0.25rem;
      margin-left: 0;
      left: 0 !important;
      right: auto !important;
      z-index: 50;
      min-width: 100%;
    }
    :host-context(.dark) .ng-dropdown-panel {
      background-color: rgb(55 65 81);
      border-color: rgb(75 85 99);
    }
    .ng-option {
      padding: 0.625rem 0.75rem;
      color: rgb(107 114 128);
      font-size: 0.875rem;
      line-height: 1.25rem;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
    }
    :host-context(.dark) .ng-option {
      color: rgb(209 213 219);
    }
    .ng-option:hover,
    .ng-option.ng-option-highlighted {
      background-color: rgb(249 250 251);
      color: rgb(17 24 39);
    }
    :host-context(.dark) .ng-option:hover,
    :host-context(.dark) .ng-option.ng-option-highlighted {
      background-color: rgb(75 85 99);
      color: rgb(249 250 251);
    }
    .ng-option.ng-option-selected {
      background-color: rgb(249 115 22);
      color: white;
    }
    :host-context(.dark) .ng-option.ng-option-selected {
      background-color: rgb(249 115 22);
      color: white;
    }
    .ng-option.ng-option-disabled {
      color: rgb(156 163 175);
      cursor: not-allowed;
    }
    :host-context(.dark) .ng-option.ng-option-disabled {
      color: rgb(156 163 175);
    }
    .ng-select .ng-select-container {
      min-height: 18px;
      height: 18px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
    }
    .ng-select.ng-select-opened .ng-select-container {
      height: 48px;
    }
    .ng-value-container {
      display: none !important;
    }
    .ng-placeholder {
      color: rgb(156 163 175);
      font-size: 0.875rem;
      padding: 0.75rem;
      line-height: 1.5;
    }
    :host-context(.dark) .ng-placeholder {
      color: rgb(156 163 175);
    }
    .ng-input {
      padding: 0.75rem;
      display: flex;
      align-items: center;
      height: 48px;
    }
    .ng-input > input {
      padding: 0 !important;
      border: none !important;
      outline: none !important;
      background: transparent !important;
      font-size: 0.875rem;
      height: 24px;
      line-height: 1.5;
      margin: 0;
      display: flex;
      align-items: center;
    }
    .ng-arrow-wrapper {
      width: 25px;
      padding-right: 0.75rem;
      display: flex;
      align-items: center;
      height: 100%;
    }
    .ng-arrow-wrapper .ng-arrow {
      border-color: rgb(107 114 128) transparent transparent;
      border-style: solid;
      border-width: 5px 5px 0;
    }
    .ng-select.ng-select-focused .ng-arrow-wrapper .ng-arrow {
      border-color: rgb(249 115 22) transparent transparent;
    }
    .ng-select.ng-select-opened .ng-arrow-wrapper .ng-arrow {
      border-color: transparent transparent rgb(107 114 128);
      border-width: 0 5px 5px;
    }
    .ng-clear-wrapper {
      color: rgb(107 114 128);
      padding-right: 0.5rem;
    }
    .ng-clear-wrapper:hover {
      color: rgb(239 68 68);
    }
    .ng-select.ng-select-focused .ng-dropdown-panel {
      left: 0 !important;
      right: auto !important;
      transform: none !important;
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
export class EditableMultiSelectComponent implements ControlValueAccessor, OnChanges, Validators {
  readonly dataArray = input.required<any[]>();
  readonly maxSelectedItems = input.required<number>();
  readonly multiple = input<boolean>(true);
  readonly id = input.required<string>();
  readonly minTermLength = input<number>(0);
  readonly allowAddTag = input<boolean>(true);
  readonly placeholder = input<string>('');

  readonly onSearch = output();

  protected selectValue: any;
  protected selectedItems: any[] = [];

  private touched = false;
  private onChange = (_value: any) => {
  };
  private onTouched = () => {
  };

  ngOnChanges(): void {
    this.dataArray()?.map((c, i) => {
      return { id: i, name: c };
    });
    this.updateSelectedItems();
  }

  public registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  public registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  public writeValue(value: any) {
    this.selectValue = value;
    this.updateSelectedItems();
  }

  protected onSelectChange(inputValue: any) {
    this.markAsTouched();
    this.selectValue = inputValue;
    this.updateSelectedItems();
    this.onChange(this.selectValue);
  }

  protected onSelectSearch(event: any) {
    this.onSearch.emit(event);
  }

  protected removeItem(itemId: any) {
    if (Array.isArray(this.selectValue)) {
      this.selectValue = this.selectValue.filter(id => id !== itemId);
    } else {
      this.selectValue = null;
    }
    this.updateSelectedItems();
    this.onChange(this.selectValue);
  }

  private updateSelectedItems() {
    if (!this.selectValue || !this.dataArray()) {
      this.selectedItems = [];
      return;
    }

    if (Array.isArray(this.selectValue)) {
      this.selectedItems = this.dataArray().filter(item => this.selectValue.includes(item.id));
    } else {
      const selectedItem = this.dataArray().find(item => item.id === this.selectValue);
      this.selectedItems = selectedItem ? [selectedItem] : [];
    }
  }

  protected addTag = (term: string) => {
    return { id: Date.now(), name: term };
  };

  private markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
}
