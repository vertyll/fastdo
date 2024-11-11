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
  template: ` <div>
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
      [placeholder]="placeholder"
    >
      @for (item of dataArray; track $index) {
        <ng-option [value]="item.id">
          {{ item.name }}
        </ng-option>
      }
    </ng-select>
  </div>`,
  styles: `
    .ng-select-taggable::after {
      content: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-pencil' viewBox='0 0 16 16'%3e%3cpath d='M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z'/%3e%3c/svg%3e");
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: 55px;
      filter: invert(62%) sepia(3%) saturate(6%) hue-rotate(335deg)
        brightness(91%) contrast(81%);
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
