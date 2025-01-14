import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FilterMetadata } from '../interfaces/filter.interface';

@Injectable({ providedIn: 'root' })
export class FiltersService {
  public createForm(filters: FilterMetadata[]): FormGroup {
    const group: any = {};
    filters.forEach(filter => {
      switch (filter.type) {
        case 'editableMultiSelect':
          group[filter.formControlName] = new FormControl(
            filter.defaultValue || [],
          );
          break;
        default:
          group[filter.formControlName] = new FormControl(
            filter.defaultValue || '',
          );
      }
    });
    return new FormGroup(group);
  }

  public createDefaultFormValues(filters: FilterMetadata[]): any {
    const values: any = {};
    filters.forEach(filter => {
      values[filter.formControlName] = filter.defaultValue
        || (filter.type === 'editableMultiSelect' ? [] : '');
    });
    return values;
  }
}
