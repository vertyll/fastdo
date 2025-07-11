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
          class="bg-background-secondary dark:bg-dark-background-secondary dark:text-dark-text-primary transition-colors duration-transitionDuration-200 block px-2.5 pb-2.5 pt-4 w-full text-sm text-text-primary rounded-lg border border-border-primary dark:border-dark-border-primary appearance-none focus:outline-none focus:ring-0 focus:border-primary-600 dark:focus:border-primary-500 peer"
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
    .ng-select .ng-select-container {
      height: auto;
      display: flex;
      align-items: center;
      transition: height 0.2s;
    }

    .ng-select .ng-input {
      padding-left: 0.75rem !important;
    }

    .ng-dropdown-panel {
      background-color: var(--background-secondary, rgb(255 255 255));
      border: 1px solid var(--border-primary, rgb(229 231 235));
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
      margin-top: 0;
      min-width: 100%;
      z-index: 50;
      left: 0;
      top: 100%;
    }
    :host-context(.dark) .ng-dropdown-panel {
      background-color: var(--dark-background-secondary, rgb(55 65 81));
      border-color: var(--dark-border-primary, rgb(75 85 99));
    }
    .ng-option {
      padding: 0.625rem 0.75rem;
      color: var(--text-secondary, rgb(107 114 128));
      font-size: 0.875rem;
      line-height: 1.25rem;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      border-radius: 0.375rem;
    }
    :host-context(.dark) .ng-option {
      color: var(--dark-text-secondary, rgb(209 213 219));
    }
    .ng-option:hover,
    .ng-option.ng-option-highlighted {
      background-color: var(--background-primary, rgb(249 250 251));
      color: var(--text-primary, rgb(17 24 39));
    }
    :host-context(.dark) .ng-option:hover,
    :host-context(.dark) .ng-option.ng-option-highlighted {
      background-color: var(--dark-background-primary, rgb(75 85 99));
      color: var(--dark-text-primary, rgb(249 250 251));
    }
    .ng-option.ng-option-selected {
      background-color: var(--primary-600, rgb(249 115 22));
      color: #fff;
    }
    :host-context(.dark) .ng-option.ng-option-selected {
      background-color: var(--primary-600, rgb(249 115 22));
      color: #fff;
    }
    .ng-option.ng-option-disabled {
      color: var(--text-disabled, rgb(156 163 175));
      cursor: not-allowed;
    }
    :host-context(.dark) .ng-option.ng-option-disabled {
      color: var(--text-disabled, rgb(156 163 175));
    }
    .ng-placeholder {
      color: var(--text-secondary, rgb(156 163 175));
      font-size: 0.875rem;
      padding: 0.75rem;
      line-height: 1.5;
    }
    :host-context(.dark) .ng-placeholder {
      color: var(--dark-text-secondary, rgb(156 163 175));
    }

    .ng-arrow-wrapper {
      width: 25px;
      padding-right: 0.75rem;
      display: flex;
      align-items: center;
      height: 100%;
    }
    .ng-arrow-wrapper .ng-arrow {
      border-color: var(--text-secondary, rgb(107 114 128)) transparent transparent;
      border-style: solid;
      border-width: 5px 5px 0;
    }
    .ng-select.ng-select-focused .ng-arrow-wrapper .ng-arrow {
      border-color: var(--primary-600, rgb(249 115 22)) transparent transparent;
    }
    .ng-select.ng-select-opened .ng-arrow-wrapper .ng-arrow {
      border-color: transparent transparent var(--text-secondary, rgb(107 114 128));
      border-width: 0 5px 5px;
    }
    .ng-clear-wrapper {
      color: var(--text-secondary, rgb(107 114 128));
      padding-right: 0.5rem;
    }
    .ng-clear-wrapper:hover {
      color: var(--danger-600, rgb(239 68 68));
    }
    .ng-select.ng-select-focused .ng-dropdown-panel {
      left: 0;
      right: auto;
      transform: none;
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
