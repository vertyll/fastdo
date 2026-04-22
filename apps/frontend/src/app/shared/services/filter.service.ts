import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FilterMetadata } from '../defs/filter.defs';
import { FilterTypeEnum } from '../enums/filter-type.enum';

@Injectable({ providedIn: 'root' })
export class FiltersService {
  public createForm(filters: FilterMetadata[]): FormGroup {
    const group: any = {};
    filters.forEach(filter => {
      if (filter.type === FilterTypeEnum.EditableMultiSelect) {
        group[filter.formControlName] = new FormControl(filter.defaultValue || []);
      } else {
        group[filter.formControlName] = new FormControl(filter.defaultValue || '');
      }
    });
    return new FormGroup(group);
  }

  public createDefaultFormValues(filters: FilterMetadata[]): any {
    const values: any = {};
    filters.forEach(filter => {
      values[filter.formControlName] =
        filter.defaultValue || (filter.type === FilterTypeEnum.EditableMultiSelect ? [] : '');
    });
    return values;
  }
}
