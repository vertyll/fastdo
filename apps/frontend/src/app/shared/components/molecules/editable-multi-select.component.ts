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
import { LabelComponent } from '../atoms/label.component';

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
        notFoundText="{{ 'Basic.noItemsFound' | translate }}"
        (search)="onSelectSearch($event)"
        [minTermLength]="minTermLength"
        [addTag]="allowAddTag ? addTag : false"
        [addTagText]="
          allowAddTag ? ('EditableMultiSelect.addTagsAdHoc' | translate) : null
        "
        class="block px-2 pb-2.5 pt-3 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-orange-600 peer"
      >
        @for (item of dataArray; track $index) {
          <ng-option [value]="item.id">
            {{ item.name }}
          </ng-option>
        }
      </ng-select>
      <app-label [forId]="id">{{ placeholder }}</app-label>
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
export class EditableMultiSelectComponent
  implements ControlValueAccessor, OnChanges, Validators
{
  @Input() dataArray!: any[];
  @Input() maxSelectedItems!: number;
  @Input() multiple: boolean = true;
  @Input() id!: string;
  @Input() minTermLength: number = 0;
  @Input() allowAddTag: boolean = true;
  @Input() placeholder: string = '';

  @Output() onSearch = new EventEmitter();

  protected selectValue: any;

  private touched = false;
  private onChange = (value: any) => {};
  private onTouched = () => {};

  ngOnChanges(): void {
    this.dataArray?.map((c, i) => {
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
