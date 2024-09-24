import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { TASK_STATUS, TaskStatus } from '../enums/task-status.enum';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { featherChevronDown, featherChevronUp } from '@ng-icons/feather-icons';

type TasksListFiltersForm = FormGroup<{
  q: FormControl<string>;
  status: FormControl<TaskStatus>;
  sortBy: FormControl<'dateCreation' | 'dateModification' | 'name'>;
  orderBy: FormControl<'asc' | 'desc'>;
  createdFrom: FormControl<string>;
  createdTo: FormControl<string>;
  updatedFrom: FormControl<string>;
  updatedTo: FormControl<string>;
}>;

export type TasksListFiltersFormValue = {
  q: string;
  status: TaskStatus;
  sortBy: 'dateCreation' | 'dateModification' | 'name';
  orderBy: 'asc' | 'desc';
  createdFrom: string;
  createdTo: string;
  updatedFrom: string;
  updatedTo: string;
};

@Component({
  standalone: true,
  selector: 'app-tasks-list-filters',
  imports: [ReactiveFormsModule, NgIconComponent],
  viewProviders: [provideIcons({ featherChevronDown, featherChevronUp })],
  template: `
    <form
      [formGroup]="form"
      class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
    >
      <div class="mb-4 grid grid-cols-1 md:grid-cols-6 gap-4">
        @for (field of visibleFields; track field) {
          <div>
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              [for]="'filter-' + field"
            >
              {{ getFieldLabel(field) }}
            </label>
            @if (isSelectField(field)) {
              <select
                [formControlName]="field"
                [id]="'filter-' + field"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                @for (option of getFieldOptions(field); track option.value) {
                  <option [value]="option.value">{{ option.label }}</option>
                }
              </select>
            } @else {
              <input
                [formControlName]="field"
                [id]="'filter-' + field"
                [type]="getFieldType(field)"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                [placeholder]="getFieldPlaceholder(field)"
              />
            }
          </div>
        }
      </div>
      <div class="flex justify-end">
        <button
          type="button"
          (click)="toggleFilters()"
          class="text-blue-500 hover:text-blue-700"
        >
          <ng-icon
            [name]="showAllFilters ? 'featherChevronUp' : 'featherChevronDown'"
            size="24"
          />
        </button>
      </div>
    </form>
    <div class="mt-2">
      <div class="flex justify-between items-center mb-1">
        <h3 class="text-sm font-semibold">Active filters:</h3>
        @if (activeFilters.length > 0) {
          <button
            (click)="removeAllFilters()"
            class="text-xs text-red-500 hover:text-red-700"
          >
            Clear all
          </button>
        }
      </div>
      <div class="flex flex-wrap gap-1 mb-10">
        @for (filter of activeFilters; track filter.key) {
          <span
            class="bg-gray-200 px-1 py-0.5 rounded flex items-center text-xs"
          >
            {{ filter.label }}: {{ filter.value }}
            @if (
              filter.key !== 'sortBy' &&
              filter.key !== 'orderBy' &&
              filter.key !== 'status'
            ) {
              <button
                (click)="removeFilter(filter.key)"
                class="ml-1 text-red-500 hover:text-red-700"
              >
                &times;
              </button>
            }
          </span>
        }
      </div>
    </div>
  `,
})
export class TasksListFiltersComponent implements OnInit {
  private formBuilder = inject(NonNullableFormBuilder);

  @Output() filtersChange = new EventEmitter<TasksListFiltersFormValue>();

  form: TasksListFiltersForm = this.formBuilder.group({
    q: [''],
    status: [TASK_STATUS.ALL as TaskStatus],
    sortBy: ['dateCreation' as 'dateCreation' | 'dateModification' | 'name'],
    orderBy: ['desc' as 'asc' | 'desc'],
    createdFrom: [''],
    createdTo: [''],
    updatedFrom: [''],
    updatedTo: [''],
  });

  allFields = [
    'q',
    'status',
    'sortBy',
    'orderBy',
    'createdFrom',
    'createdTo',
    'updatedFrom',
    'updatedTo',
  ];
  protected visibleFields = this.allFields.slice(0, 6);
  protected showAllFilters: boolean = false;
  protected activeFilters: { key: string; label: string; value: string }[] = [];

  ngOnInit(): void {
    this.updateActiveFilters();
    this.form.valueChanges.subscribe(() => {
      this.updateActiveFilters();
      this.filtersChange.emit(this.form.getRawValue());
    });
  }

  toggleFilters(): void {
    this.showAllFilters = !this.showAllFilters;
    this.visibleFields = this.showAllFilters
      ? this.allFields
      : this.allFields.slice(0, 6);
  }

  getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      q: 'Search',
      status: 'Status',
      sortBy: 'Sort by',
      orderBy: 'Order',
      createdFrom: 'Created from',
      createdTo: 'Created to',
      updatedFrom: 'Updated from',
      updatedTo: 'Updated to',
    };
    return labels[field] || field;
  }

  isSelectField(field: string): boolean {
    return ['status', 'sortBy', 'orderBy'].includes(field);
  }

  getFieldOptions(field: string): { value: string; label: string }[] {
    if (field === 'status') {
      return [
        { value: TASK_STATUS.ALL, label: 'All' },
        { value: TASK_STATUS.TODO, label: 'To do' },
        { value: TASK_STATUS.DONE, label: 'Done' },
      ];
    } else if (field === 'sortBy') {
      return [
        { value: 'dateCreation', label: 'Created at' },
        { value: 'dateModification', label: 'Updated at' },
        { value: 'name', label: 'Name' },
      ];
    } else if (field === 'orderBy') {
      return [
        { value: 'desc', label: 'Descending' },
        { value: 'asc', label: 'Ascending' },
      ];
    }
    return [];
  }

  getFieldType(field: string): string {
    return ['createdFrom', 'createdTo', 'updatedFrom', 'updatedTo'].includes(
      field,
    )
      ? 'date'
      : 'text';
  }

  getFieldPlaceholder(field: string): string {
    return field === 'q' ? 'Enter task name' : '';
  }

  updateActiveFilters(): void {
    const formValues = this.form.getRawValue();
    this.activeFilters = Object.entries(formValues)
      .filter(
        ([key, value]) =>
          (value !== '' && value !== null) ||
          ['sortBy', 'orderBy', 'status'].includes(key),
      )
      .map(([key, value]) => ({
        key,
        label: this.getFieldLabel(key),
        value: this.formatFilterValue(key, value as string),
      }));
  }

  formatFilterValue(key: string, value: string): string {
    if (this.isSelectField(key)) {
      const option = this.getFieldOptions(key).find(
        (opt) => opt.value === value,
      );
      return option ? option.label : value;
    }
    return value;
  }

  removeFilter(key: string) {
    if (key in this.form.controls) {
      (this.form.get(key) as FormControl<string>)?.setValue('');
    }
  }

  removeAllFilters(): void {
    const { sortBy, orderBy } = this.form.value;
    this.form.reset({ sortBy, orderBy });
    this.updateActiveFilters();
    this.filtersChange.emit(this.form.getRawValue());
  }
}
