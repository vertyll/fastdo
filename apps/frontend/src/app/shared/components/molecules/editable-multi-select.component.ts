import { Component, input, output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-editable-multi-select',
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, TranslateModule],
  template: `
    <mat-form-field appearance="outline" class="w-full">
      <mat-label>{{ placeholder() }}</mat-label>
      <mat-select
        [id]="id()"
        [multiple]="multiple()"
        [(ngModel)]="selectValue"
        (selectionChange)="onSelectChange($event)"
        (openedChange)="onOpenedChange($event)"
      >
        @for (item of normalizedDataArray; track item.id) {
          <mat-option [value]="item.id">{{ item.name }}</mat-option>
        }
        @if (normalizedDataArray.length === 0) {
          <mat-option disabled>{{ 'Basic.noItemsFound' | translate }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: EditableMultiSelectComponent,
    },
  ],
})
export class EditableMultiSelectComponent implements ControlValueAccessor, Validators {
  public readonly dataArray = input.required<any[]>();
  public readonly maxSelectedItems = input<number | undefined>(undefined);
  public readonly multiple = input<boolean>(true);
  public readonly id = input.required<string>();
  public readonly minTermLength = input<number>(0);
  public readonly allowAddTag = input<boolean>(true);
  public readonly placeholder = input<string>('');
  public readonly isFloating = input<boolean>(true);

  public readonly searched = output();

  protected selectValue: any;

  private touched = false;

  public get normalizedDataArray(): Array<{ id: any; name: string }> {
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

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  public writeValue(value: any): void {
    this.selectValue = value;
  }

  protected onSelectChange(event: MatSelectChange): void {
    this.markAsTouched();
    this.selectValue = event.value;
    this.onChange(this.selectValue);
  }

  protected onOpenedChange(opened: boolean): void {
    if (!opened) {
      this.markAsTouched();
    }
  }

  private onChange = (_value: any): void => {};

  private onTouched = (): void => {};

  private markAsTouched(): void {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
}
