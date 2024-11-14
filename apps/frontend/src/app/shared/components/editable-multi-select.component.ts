import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-editable-multi-select',
  template: `
    <div class="relative">
      <ng-select
        [multiple]="multiple"
        bindLabel="label"
        [searchable]="true"
        (change)="onSelectChange($event)"
        [(ngModel)]="selectValue"
        [maxSelectedItems]="maxSelectedItems"
        [id]="id"
        notFoundText="{{ 'Base.noItemsFound' | translate }}"
        (search)="onSelectSearch($event)"
        [minTermLength]="minTermLength"
        [addTag]="allowAddTag ? addTag : false"
        [addTagText]="
          allowAddTag ? ('EditableMultiSelect.addTagsAdHoc' | translate) : null
        "
        class="block px-2 pb-2.5 pt-3 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 appearance-none dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
      >
        @for (item of dataArray; track $index) {
          <ng-option [value]="item.id">
            {{ item.name }}
          </ng-option>
        }
      </ng-select>
      <label
        [for]="id"
        class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-800 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-4"
      >
        {{ placeholder }}
      </label>
    </div>
  `,
  styles: `
    ::ng-deep ng-dropdown-panel {
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
    CommonModule,
    NgSelectComponent,
    TranslateModule,
    FormsModule,
    NgSelectModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: EditableMultiSelectComponent,
    },
  ],
})
export class EditableMultiSelectComponent
  implements ControlValueAccessor, OnChanges, Validators
{
  @Input()
  dataArray!: any[];
  @Input()
  maxSelectedItems!: number;
  @Input()
  multiple: boolean = true;
  @Input()
  id!: string;
  @Input()
  minTermLength: number = 0;
  @Input()
  allowAddTag: boolean = true;
  @Input()
  placeholder: string = '';

  @Output()
  onSearch = new EventEmitter();

  selectValue: any;
  touched = false;

  onChange = (value: any) => {};
  onTouched = () => {};

  ngOnChanges(): void {
    this.dataArray?.map((c, i) => {
      return { id: i, name: c };
    });
  }

  onSelectChange(inputValue: any) {
    this.markAsTouched();
    this.selectValue = inputValue;
    this.onChange(this.selectValue);
  }

  onSelectSearch(event: any) {
    this.onSearch.emit(event);
  }

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  writeValue(value: any) {
    this.selectValue = value;
  }

  addTag = (term: string) => {
    return { label: term };
  };
}
