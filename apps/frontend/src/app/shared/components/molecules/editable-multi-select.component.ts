import { Component, OnChanges, ViewEncapsulation, input, output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { LabelComponent } from '../atoms/label.component';

@Component({
  selector: 'app-editable-multi-select',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="relative">
      <ng-select
        [multiple]="multiple()"
        bindLabel="label"
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
        class="dark:bg-gray-700 dark:text-white block px-2 pb-2.5 pt-3 w-full text-sm transition-colors duration-200 text-gray-900 bg-white rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-orange-600 peer"
      >
        @for (item of dataArray(); track $index) {
          <ng-option [value]="item.id">
            {{ item.name }}
          </ng-option>
        }
      </ng-select>
      <app-label [forId]="id()" [isField]="true">{{ placeholder() }}</app-label>
    </div>
  `,
  styles: `
    .ng-dropdown-panel {
      background-color: white;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-top: 0.7rem;
      z-index: 10;
      left: 0;
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

  private touched = false;
  private onChange = (_value: any) => {
  };
  private onTouched = () => {
  };

  ngOnChanges(): void {
    this.dataArray()?.map((c, i) => {
      return { id: i, name: c };
    });
  }

  public registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  public registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
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

  protected addTag = (term: string) => {
    return { label: term };
  };

  private markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
}
