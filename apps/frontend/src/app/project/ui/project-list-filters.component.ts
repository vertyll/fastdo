import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroChevronDown, heroChevronUp } from '@ng-icons/heroicons/outline';

type ProjectsListFiltersForm = FormGroup<{
  q: FormControl<string>;
  sortBy: FormControl<'name' | 'dateCreation'>;
  orderBy: FormControl<'asc' | 'desc'>;
  createdFrom: FormControl<string>;
  createdTo: FormControl<string>;
  updatedFrom: FormControl<string>;
  updatedTo: FormControl<string>;
}>;

export interface ProjectsListFiltersFormValue {
  q?: string;
  sortBy?: 'name' | 'dateCreation';
  orderBy?: 'asc' | 'desc';
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
}

@Component({
  standalone: true,
  selector: 'app-projects-list-filters',
  imports: [ReactiveFormsModule, NgIconComponent],
  viewProviders: [provideIcons({ heroChevronDown, heroChevronUp })],
  template: `
    <form
      [formGroup]="form"
      class="bg-white shadow-md rounded px-8 pt-6 pb-4 mb-4"
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
            [name]="showAllFilters ? 'heroChevronUp' : 'heroChevronDown'"
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
            @if (filter.key !== 'sortBy' && filter.key !== 'orderBy') {
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
export class ProjectsListFiltersComponent implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  @Output() filtersChange = new EventEmitter<ProjectsListFiltersFormValue>();

  form: ProjectsListFiltersForm = this.formBuilder.group({
    q: [''],
    sortBy: ['dateCreation' as 'dateCreation' | 'name'],
    orderBy: ['desc' as 'asc' | 'desc'],
    createdFrom: [''],
    createdTo: [''],
    updatedFrom: [''],
    updatedTo: [''],
  });

  allFields = [
    'q',
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

  protected toggleFilters(): void {
    this.showAllFilters = !this.showAllFilters;
    this.visibleFields = this.showAllFilters
      ? this.allFields
      : this.allFields.slice(0, 6);
  }

  protected getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      q: 'Search',
      sortBy: 'Sort by',
      orderBy: 'Order',
      createdFrom: 'Created from',
      createdTo: 'Created to',
      updatedFrom: 'Updated from',
      updatedTo: 'Updated to',
    };
    return labels[field] || field;
  }

  protected isSelectField(field: string): boolean {
    return ['sortBy', 'orderBy'].includes(field);
  }

  protected getFieldOptions(field: string): { value: string; label: string }[] {
    if (field === 'sortBy') {
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

  protected getFieldType(field: string): string {
    return ['createdFrom', 'createdTo', 'updatedFrom', 'updatedTo'].includes(
      field,
    )
      ? 'date'
      : 'text';
  }

  protected getFieldPlaceholder(field: string): string {
    return field === 'q' ? 'Enter project name' : '';
  }

  protected removeFilter(key: string): void {
    if (key in this.form.controls) {
      (this.form.get(key) as FormControl<string>)?.setValue('');
    }
  }

  protected removeAllFilters(): void {
    const { sortBy, orderBy } = this.form.value;
    this.form.reset({ sortBy, orderBy });
    this.updateActiveFilters();
    this.filtersChange.emit(this.form.getRawValue());
  }

  private updateActiveFilters() {
    const formValues = this.form.getRawValue();
    this.activeFilters = Object.entries(formValues)
      .filter(
        ([key, value]) =>
          (value !== '' && value !== null) ||
          ['sortBy', 'orderBy'].includes(key),
      )
      .map(([key, value]) => ({
        key,
        label: this.getFieldLabel(key),
        value: this.formatFilterValue(key, value as string),
      }));
  }

  private formatFilterValue(key: string, value: string): string {
    if (this.isSelectField(key)) {
      const option = this.getFieldOptions(key).find(
        (opt) => opt.value === value,
      );
      return option ? option.label : value;
    }
    return value;
  }
}
