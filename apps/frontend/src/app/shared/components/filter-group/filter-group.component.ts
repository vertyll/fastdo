import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Subscription, debounceTime, firstValueFrom } from 'rxjs';
import { DateFilterComponent } from './date-filter.component';
import { NumberFilterComponent } from './number-filter.component';
import { SelectFilterComponent } from './select-filter.component';
import { TextFilterComponent } from './text-filter.component';
import { CheckSelectFilterComponent } from './check-select-filter.component';
import { EditableMultiSelectComponent } from '../editable-multi-select.component';
import { FilterMetadata, FilterValue } from '../../interfaces/filter.interface';
import { FiltersService } from '../../services/filter.service';
import { PlatformService } from '../../services/platform.service';
import {
  SavePartial,
  ClearPartial,
  ClearFilter,
} from '../../store/filter/filter.actions';

@Component({
  selector: 'app-filter-group',
  standalone: true,
  template: `
    <div>
      <div>
        <form [formGroup]="form">
          <div>
            @for (filter of filters.slice(0, 4); track $index) {
              <div>
                @switch (filter.type) {
                  @case ('text') {
                    <app-text-filter
                      [control]="getFormControl(filter.formControlName)"
                      [id]="filter.formControlName"
                      [label]="translateService.instant(filter.labelKey)"
                    />
                  }
                  @case ('number') {
                    <app-number-filter
                      [control]="getFormControl(filter.formControlName)"
                      [id]="filter.formControlName"
                      [label]="translateService.instant(filter.labelKey)"
                    />
                  }
                  @case ('date') {
                    <app-date-filter
                      [control]="getFormControl(filter.formControlName)"
                      [id]="filter.formControlName"
                      [label]="translateService.instant(filter.labelKey)"
                    />
                  }
                  @case ('select') {
                    <app-select-filter
                      [control]="getFormControl(filter.formControlName)"
                      [id]="filter.formControlName"
                      [label]="translateService.instant(filter.labelKey)"
                      [options]="filter.options || []"
                    />
                  }
                  @case ('checkSelect') {
                    <app-check-select-filter
                      [control]="getFormControl(filter.formControlName)"
                      [id]="filter.formControlName"
                      [label]="translateService.instant(filter.labelKey)"
                      [options]="filter.options || []"
                    />
                  }
                  @case ('editableMultiSelect') {
                    <app-editable-multi-select
                      [formControlName]="filter.formControlName"
                      [id]="filter.formControlName"
                      [dataArray]="filter.multiselectOptions || []"
                      [maxSelectedItems]="filter.maxSelectedItems || 1"
                      [minTermLength]="filter.minTermLength || 1"
                      [allowAddTag]="filter.allowAddTag || false"
                      (onSearch)="onFilterSearch($event, filter)"
                      [placeholder]="translateService.instant(filter.labelKey)"
                    />
                  }
                }
              </div>
            }
            @for (filter of filters.slice(4); let i = $index; track $index) {
              <div [class.hidden]="!showAllFilters">
                @switch (filter.type) {
                  @case ('text') {
                    <app-text-filter
                      [control]="getFormControl(filter.formControlName)"
                      [id]="filter.formControlName"
                      [label]="translateService.instant(filter.labelKey)"
                    />
                  }
                  @case ('number') {
                    <app-number-filter
                      [control]="getFormControl(filter.formControlName)"
                      [id]="filter.formControlName"
                      [label]="translateService.instant(filter.labelKey)"
                    />
                  }
                  @case ('date') {
                    <app-date-filter
                      [control]="getFormControl(filter.formControlName)"
                      [id]="filter.formControlName"
                      [label]="translateService.instant(filter.labelKey)"
                    />
                  }
                  @case ('select') {
                    <app-select-filter
                      [control]="getFormControl(filter.formControlName)"
                      [id]="filter.formControlName"
                      [label]="translateService.instant(filter.labelKey)"
                      [options]="filter.options || []"
                    />
                  }
                  @case ('checkSelect') {
                    <app-check-select-filter
                      [control]="getFormControl(filter.formControlName)"
                      [id]="filter.formControlName"
                      [label]="translateService.instant(filter.labelKey)"
                      [options]="filter.options || []"
                    />
                  }
                  @case ('editableMultiSelect') {
                    <app-editable-multi-select
                      [formControlName]="filter.formControlName"
                      [id]="filter.formControlName"
                      [dataArray]="filter.multiselectOptions || []"
                      [maxSelectedItems]="filter.maxSelectedItems || 1"
                      [minTermLength]="filter.minTermLength || 1"
                      [allowAddTag]="filter.allowAddTag || false"
                      (onSearch)="onFilterSearch($event, filter)"
                      [placeholder]="translateService.instant(filter.labelKey)"
                    />
                  }
                }
              </div>
            }
          </div>
          @if (filters.length > 4) {
            <div>
              <button type="button" (click)="toggleFilters()">
                {{
                  showAllFilters
                    ? ('Filters.showLessFilters' | translate)
                    : ('Filters.showMoreFilters' | translate)
                }}
              </button>
            </div>
          }
        </form>
        @if (filledFilters.length) {
          <p>
            <b>{{ 'Filters.filtersSet' | translate }}: </b>
            @for (filter of filledFilters; track $index) {
              <span>
                {{ translateService.instant('Filters.' + filter.id) }}: ({{
                  filter.value
                }})
              </span>
            }
            <span (click)="clearFilters()">
              <b>{{ 'Filters.clearFilters' | translate }}</b>
            </span>
          </p>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      width: 100%;
    }

    .filled-filters {
      margin: 0.5rem;
      color: var(--gray-color);
      font-size: 0.8rem;
    }

    .clear-filters {
      display: inline-flex;
      align-items: center;
      margin-left: 0.5rem;
      cursor: pointer;
    }

    .hidden {
      display: none;
    }

    #mobile-filters-button {
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      ion-icon {
        font-size: 1.4rem;
        margin-right: 1rem;
      }

      p {
        font-weight: 600;
        letter-spacing: 1px;
      }
    }

    #filters-content {
      overflow: hidden;
      max-height: 0;
      transition: max-height 0.5s ease;

      &:not(.hidden) {
        max-height: var(--max-height);
      }
    }

    ::ng-deep {
      .ng-select.custom-form-select {
        padding: 0;
        border: none;

        .ng-select-container {
          height: calc(3.5rem + calc(var(--bs-border-width) * 2));
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
          width: 100%;
          font-weight: 400;
          line-height: 1.5;
          color: var(--bs-body-color);
          background-color: var(--bs-body-bg);
          background-clip: padding-box;
          border: var(--bs-border-width) solid var(--bs-border-color);
          border-radius: var(--bs-border-radius);
          transition:
            border-color 0.15s ease-in-out,
            box-shadow 0.15s ease-in-out;

          .ng-value-container {
            padding: 0;
          }

          .ng-placeholder {
            color: var(--bs-placeholder-color);
          }
        }

        &.ng-select-opened > .ng-select-container {
          border-color: #86b7fe;
          outline: 0;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
      }
    }
  `,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    TextFilterComponent,
    SelectFilterComponent,
    DateFilterComponent,
    NumberFilterComponent,
    CheckSelectFilterComponent,
    EditableMultiSelectComponent,
  ],
})
export class FilterGroupComponent<T extends Record<string, any>>
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input()
  type!: string;
  @Input()
  set filters(value: FilterMetadata[]) {
    this._filters = value;
    if (this.form) {
      this.form = this.filtersService.createForm(this._filters);
      this.populateFiltersFromUrl();
      this.initFilters();
    }
  }
  @Output()
  filterChange = new EventEmitter<T>();
  @Output()
  filterSearch = new EventEmitter<{
    term: string;
    filter: string;
  }>();

  private _filters: FilterMetadata[] = [];
  public form!: FormGroup;
  public filledFilters: FilterValue[] = [];
  public mobileFilterToggleHidden$;
  public showAllFilters = false;

  private formChangeSubscriptions: Subscription[] = [];
  private langChangeSubscription!: Subscription;

  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly platformService = inject(PlatformService);
  private readonly filtersService = inject(FiltersService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor(public readonly translateService: TranslateService) {
    this.mobileFilterToggleHidden$ = this.platformService.isMobile$;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToLanguageChanges();
  }

  ngAfterViewInit(): void {
    this.initFilters();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  public onFilterSearch(event: any, filter: FilterMetadata): void {
    this.filterSearch.emit({
      term: event.term,
      filter: filter.formControlName,
    });
  }

  public clearFilters(): void {
    this.resetFormAndNavigate();
  }

  public toggleMobileFiltersVisibility(): void {
    this.mobileFilterToggleHidden$.next(
      !this.mobileFilterToggleHidden$.getValue(),
    );
  }

  public toggleFilters(): void {
    this.showAllFilters = !this.showAllFilters;
  }

  public getFormControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  private initializeForm(): void {
    this.form = this.filtersService.createForm(this.filters);
    this.populateFiltersFromUrl();
  }

  private subscribeToLanguageChanges(): void {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(() =>
      this.getFilledFilters(),
    );
  }

  private initFilters(): void {
    const subscription = this.form.valueChanges
      .pipe(debounceTime(350))
      .subscribe(async (value) => {
        const isInInitialState = this.checkIfInInitialState(value);
        const urlParamsNotInForm = await this.getUrlParamsNotInForm();
        const formValues = this.getFormValues(value);

        if (!isInInitialState) {
          this.handleNonInitialState(formValues, urlParamsNotInForm);
        } else {
          this.handleInitialState(formValues, urlParamsNotInForm);
        }
      });

    this.formChangeSubscriptions.push(subscription);
  }

  private checkIfInInitialState(value: T): boolean {
    const defaultValues = this.filtersService.createDefaultFormValues(
      this.filters,
    );
    return Object.entries(value).every(([key, val]) =>
      this.equalsDefaultValues(key, val, defaultValues),
    );
  }

  private async getUrlParamsNotInForm(): Promise<Record<string, any>> {
    const queryParams = await firstValueFrom(this.route.queryParams);
    const formControlNames = Object.keys(
      this.filtersService.createDefaultFormValues(this.filters),
    );
    return Object.fromEntries(
      Object.entries(queryParams).filter(
        ([key]) => !formControlNames.includes(key),
      ),
    );
  }

  private getFormValues(value: T): Record<string, any> {
    const defaultFormValues = this.filtersService.createDefaultFormValues(
      this.filters,
    );
    return Object.fromEntries(
      Object.keys(defaultFormValues).map((key) => [key, value[key] || '']),
    );
  }

  private handleNonInitialState(
    formValues: Record<string, any>,
    urlParamsNotInForm: Record<string, any>,
  ): void {
    this.store.dispatch(
      new SavePartial({ type: this.type, value: formValues }),
    );
    this.updateUrlAndEmitChanges(formValues, urlParamsNotInForm);
  }

  private handleInitialState(
    formValues: Record<string, any>,
    urlParamsNotInForm: Record<string, any>,
  ): void {
    this.store.dispatch(
      new ClearPartial({ type: this.type, keys: Object.keys(formValues) }),
    );
    this.updateUrlAndEmitChanges(
      this.filtersService.createDefaultFormValues(this.filters),
      urlParamsNotInForm,
    );
  }

  private updateUrlAndEmitChanges(
    formValues: Record<string, any>,
    urlParamsNotInForm: Record<string, any>,
  ): void {
    this.router
      .navigate(['.'], {
        relativeTo: this.route,
        queryParams: { ...urlParamsNotInForm, ...formValues },
        replaceUrl: true,
      })
      .then(() => {
        this.emitFormValueChange(formValues);
        this.getFilledFilters();
      });
  }

  private populateFiltersFromUrl(): void {
    const queryParams = this.route.snapshot.queryParams;
    const filterComponentFormValues =
      this.createFilterComponentFormValues(queryParams);
    this.form.patchValue(filterComponentFormValues);
    this.getFilledFilters();
  }

  private createFilterComponentFormValues(
    queryParams: Record<string, any>,
  ): Record<string, any> {
    const defaultFormValues = this.filtersService.createDefaultFormValues(
      this.filters,
    );
    return Object.entries(defaultFormValues).reduce(
      (acc, [key, defaultValue]) => {
        const filter = this.filters.find((f) => f.formControlName === key);
        acc[key] = this.getFilterValue(filter, queryParams[key], defaultValue);
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  private getFilterValue(
    filter: FilterMetadata | undefined,
    queryParamValue: any,
    defaultValue: any,
  ): any {
    if (filter?.type === 'editableMultiSelect') {
      return this.getMultiSelectValue(queryParamValue);
    }
    return typeof defaultValue === 'number'
      ? parseInt(queryParamValue)
      : queryParamValue || defaultValue;
  }

  private getMultiSelectValue(value: any): any[] {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',');
    return [];
  }

  private emitFormValueChange(formValue: Record<string, any>): void {
    this.filterChange.emit({ ...this.form.value, ...formValue } as T);
  }

  private equalsDefaultValues(
    key: string,
    value: any,
    defaultFormValues: Record<string, any>,
  ): boolean {
    return Array.isArray(value)
      ? this.arrayEquals(value, defaultFormValues[key])
      : value == defaultFormValues[key];
  }

  private arrayEquals(arr1: any[], arr2: any[]): boolean {
    return (
      arr1.length === arr2.length &&
      arr1.every((value, index) => value === arr2[index])
    );
  }

  private getFilledFilters(): void {
    const formValue = this.form.value;
    const defaultValues = this.filtersService.createDefaultFormValues(
      this.filters,
    );

    this.filledFilters = Object.entries(formValue)
      .filter(([key, value]) => {
        const filterMetadata = this.filters.find(
          (f) => f.formControlName === key,
        );
        const isDefaultValue = this.equalsDefaultValues(
          key,
          value,
          defaultValues,
        );
        return filterMetadata && value !== '' && !isDefaultValue;
      })
      .map(([key, value]) => this.createFilterValue(key, value));
  }

  private createFilterValue(key: string, value: any): FilterValue {
    const filterMetadata = this.filters.find((f) => f.formControlName === key);

    if (
      Array.isArray(value) &&
      filterMetadata?.type === 'editableMultiSelect'
    ) {
      return {
        id: key,
        value: this.getMultiSelectNames(filterMetadata, value),
      };
    }

    const options = filterMetadata?.options ?? [];
    return { id: key, value: this.translateOptionValue(options, value) };
  }

  private getMultiSelectNames(
    filterMetadata: FilterMetadata,
    value: any[],
  ): string {
    return value
      .map((id) => {
        const option = filterMetadata.multiselectOptions?.find(
          (opt) => opt.id === id,
        );
        return option ? option.name : id;
      })
      .join(', ');
  }

  private translateOptionValue(
    options: { value: any; label: string }[],
    value: any,
  ): string {
    const foundOption = options.find((option) => option.value == value);
    return foundOption ? this.translateService.instant(foundOption.label) : value;
  }

  private resetFormAndNavigate(): void {
    this.filledFilters = [];
    this.form.reset(this.filtersService.createDefaultFormValues(this.filters));
    this.store.dispatch(new ClearFilter({ type: this.type }));
    this.router
      .navigate(['.'], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      })
      .then(() => this.emitFormValueChange({}));
  }

  private unsubscribeAll(): void {
    this.formChangeSubscriptions.forEach((sub) => sub.unsubscribe());
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  get filters(): FilterMetadata[] {
    return this._filters;
  }
}
