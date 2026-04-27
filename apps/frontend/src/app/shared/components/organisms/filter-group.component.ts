import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Subscription, debounceTime, firstValueFrom } from 'rxjs';
import { FilterTypeEnum } from '../../enums/filter-type.enum';
import { FiltersService } from '../../services/filter.service';
import { PlatformService } from '../../services/platform.service';
import { ClearFilter, ClearPartial, SavePartial } from '../../store/filter/filter.actions';
import { FiltersSelectors } from '../../store/filter/filter.selectors';
import { FilterMetadata, FilterValue } from '../../defs/filter.defs';
import { CheckSelectComponent } from '../molecules/check-select.component';
import { EditableMultiSelectComponent } from '../molecules/editable-multi-select.component';
import { DateFieldComponent } from '../molecules/date-field.component';
import { InputFieldComponent } from '../molecules/input-field.component';
import { SelectFieldComponent } from '../molecules/select-field.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroAdjustmentsHorizontal,
  heroChevronDown,
  heroChevronUp,
  heroFunnel,
  heroXMark,
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-filter-group',
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    InputFieldComponent,
    SelectFieldComponent,
    DateFieldComponent,
    CheckSelectComponent,
    EditableMultiSelectComponent,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      heroFunnel,
      heroChevronDown,
      heroChevronUp,
      heroAdjustmentsHorizontal,
      heroXMark,
    }),
  ],
  standalone: true,
  template: `
    <div>
      @if (collapsible()) {
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-text-primary dark:text-dark-text-primary font-medium">
            <ng-icon name="heroFunnel" size="20" class="text-text-secondary dark:text-dark-text-secondary"></ng-icon>
            {{ 'Filters.title' | translate }}
            @if (filledFilters().length > 0) {
              <span class="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">{{
                filledFilters().length
              }}</span>
            }
            @if (totalResults() !== undefined) {
              <span class="text-sm font-normal text-text-secondary dark:text-dark-text-secondary ml-2">
                ({{ totalResults() }} {{ 'Basic.results' | translate }})
              </span>
            }
          </div>
          <button
            type="button"
            (click)="toggleExpand()"
            class="text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors cursor-pointer p-1 rounded-md hover:bg-background-primary dark:hover:bg-dark-background-primary flex"
          >
            @if (isExpanded()) {
              <ng-icon name="heroChevronUp" size="20"></ng-icon>
            } @else {
              <ng-icon name="heroChevronDown" size="20"></ng-icon>
            }
          </button>
        </div>
      }

      @if (!collapsible() || isExpanded()) {
        <form [formGroup]="form" class="space-y-4" [class.mt-4]="collapsible()">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (filter of filters().slice(0, mobileFilterToggleHidden() ? 2 : 4); track $index) {
              <div>
                @switch (filter.type) {
                  @case (FilterType.Text) {
                    <app-input-field
                      [control]="getFormControl(filter.formControlName)"
                      [id]="filter.formControlName"
                      [label]="translateService.instant(filter.labelKey)"
                      [type]="FilterType.Text"
                    />
                  }
                  @case (FilterType.Number) {
                    <app-input-field
                      [control]="getFormControl(filter.formControlName)"
                      [id]="filter.formControlName"
                      [label]="translateService.instant(filter.labelKey)"
                      [type]="FilterType.Number"
                    />
                  }
                  @case (FilterType.Date) {
                    <app-date-field
                      [control]="getFormControl(filter.formControlName)"
                      [id]="filter.formControlName"
                      [label]="translateService.instant(filter.labelKey)"
                    />
                  }
                  @case (FilterType.Select) {
                    <app-select-field
                      [control]="getFormControl(filter.formControlName)"
                      [id]="filter.formControlName"
                      [label]="translateService.instant(filter.labelKey)"
                      [options]="filter.options || []"
                    />
                  }
                  @case (FilterType.CheckSelect) {
                    <app-check-select
                      [control]="getFormControl(filter.formControlName)"
                      [id]="filter.formControlName"
                      [label]="translateService.instant(filter.labelKey)"
                      [options]="filter.options || []"
                    />
                  }
                  @case (FilterType.EditableMultiSelect) {
                    <app-editable-multi-select
                      [formControlName]="filter.formControlName"
                      [id]="filter.formControlName"
                      [dataArray]="filter.multiselectOptions || []"
                      [maxSelectedItems]="filter.maxSelectedItems !== undefined ? filter.maxSelectedItems : undefined"
                      [minTermLength]="filter.minTermLength || 1"
                      [allowAddTag]="filter.allowAddTag || false"
                      (searched)="onFilterSearch($event, filter)"
                      [placeholder]="translateService.instant(filter.labelKey)"
                    />
                  }
                }
              </div>
            }
          </div>
          @if (filters().length > 4) {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              @for (filter of filters().slice(4); let i = $index; track i) {
                <div [class.hidden]="!showAllFilters()">
                  @switch (filter.type) {
                    @case (FilterType.Text) {
                      <app-input-field
                        [control]="getFormControl(filter.formControlName)"
                        [id]="filter.formControlName"
                        [label]="translateService.instant(filter.labelKey)"
                        [type]="FilterType.Text"
                      />
                    }
                    @case (FilterType.Number) {
                      <app-input-field
                        [control]="getFormControl(filter.formControlName)"
                        [id]="filter.formControlName"
                        [label]="translateService.instant(filter.labelKey)"
                        [type]="FilterType.Number"
                      />
                    }
                    @case (FilterType.Date) {
                      <app-date-field
                        [control]="getFormControl(filter.formControlName)"
                        [id]="filter.formControlName"
                        [label]="translateService.instant(filter.labelKey)"
                      />
                    }
                    @case (FilterType.Select) {
                      <app-select-field
                        [control]="getFormControl(filter.formControlName)"
                        [id]="filter.formControlName"
                        [label]="translateService.instant(filter.labelKey)"
                        [options]="filter.options || []"
                      />
                    }
                    @case (FilterType.CheckSelect) {
                      <app-check-select
                        [control]="getFormControl(filter.formControlName)"
                        [id]="filter.formControlName"
                        [label]="translateService.instant(filter.labelKey)"
                        [options]="filter.options || []"
                      />
                    }
                    @case (FilterType.EditableMultiSelect) {
                      <app-editable-multi-select
                        [formControlName]="filter.formControlName"
                        [id]="filter.formControlName"
                        [dataArray]="filter.multiselectOptions || []"
                        [maxSelectedItems]="filter.maxSelectedItems !== undefined ? filter.maxSelectedItems : undefined"
                        [minTermLength]="filter.minTermLength || 1"
                        [allowAddTag]="filter.allowAddTag || false"
                        (searched)="onFilterSearch($event, filter)"
                        [placeholder]="translateService.instant(filter.labelKey)"
                      />
                    }
                  }
                </div>
              }
            </div>
            <div class="flex items-center justify-start">
              <button
                type="button"
                (click)="toggleFilters()"
                class="flex items-center gap-1.5 text-sm font-medium text-link-primary hover:text-link-hover dark:text-link-dark-primary dark:hover:text-link-dark-hover cursor-pointer transition-colors"
                [attr.aria-label]="
                  showAllFilters() ? ('Filters.showLessFilters' | translate) : ('Filters.showMoreFilters' | translate)
                "
              >
                @if (showAllFilters()) {
                  <ng-icon name="heroChevronUp" size="16"></ng-icon>
                } @else {
                  <ng-icon name="heroChevronDown" size="16"></ng-icon>
                }
                {{
                  showAllFilters() ? ('Filters.showLessFilters' | translate) : ('Filters.showMoreFilters' | translate)
                }}
              </button>
            </div>
          }
        </form>
      }

      @if (filledFilters().length) {
        <div class="mt-3">
          <p
            class="text-sm text-text-secondary-light dark:text-dark-text-primary flex items-center gap-2 flex-wrap m-0"
          >
            <ng-icon name="heroAdjustmentsHorizontal" size="16"></ng-icon>
            <b>{{ 'Filters.filtersSet' | translate }}:</b>
            @for (filter of filledFilters(); track $index) {
              <span class="mr-2">
                {{ translateService.instant(getLabelKeyForFilter(filter.id)) }}: ({{ filter.value }})
              </span>
            }
            <button
              type="button"
              (click)="clearFilters()"
              class="ml-2 inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 cursor-pointer border-0 bg-transparent p-0 font-semibold"
              [attr.aria-label]="'Filters.clearFilters' | translate"
            >
              <ng-icon name="heroXMark" size="16" class="text-red-600 dark:text-red-400"></ng-icon>
              {{ 'Filters.clearFilters' | translate }}
            </button>
          </p>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        width: 100%;
      }

      .hidden {
        display: none;
      }
    `,
  ],
})
export class FilterGroupComponent<T = any> implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  public readonly filters = input<FilterMetadata[]>([]);
  public readonly type = input<string>('');
  public readonly scope = input<string>('');
  public readonly mobileFilterToggleHidden = signal<boolean>(false);
  public readonly collapsible = input<boolean>(false);
  public readonly totalResults = input<number | undefined>(undefined);

  public readonly filterChange = output<T>(); // Emit values directly instead of strictly state reliance
  public readonly filterSearch = output<{ term: string; filter: string }>();

  public readonly isExpanded = signal<boolean>(true);

  protected form!: FormGroup;
  private readonly formChangeSubscriptions: Subscription[] = [];
  private langChangeSubscription!: Subscription;

  protected readonly filledFilters = signal<FilterValue[]>([]);
  protected readonly showAllFilters = signal<boolean>(false);

  protected readonly translateService = inject(TranslateService);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly platformService = inject(PlatformService);
  private readonly filtersService = inject(FiltersService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly FilterType = FilterTypeEnum;

  constructor() {
    effect(() => {
      this.mobileFilterToggleHidden.set(this.platformService.isMobile());
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToLanguageChanges();
    this.loadFiltersFromState();
  }

  ngOnChanges(): void {
    this.updateFilters();
  }

  ngAfterViewInit(): void {
    this.initFilters();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  public toggleExpand(): void {
    this.isExpanded.update(v => !v);
  }

  protected getLabelKeyForFilter(formControlName: string): string {
    const filter = this.filters().find(f => f.formControlName === formControlName);
    return filter?.labelKey ?? formControlName;
  }

  protected onFilterSearch(event: { term: string }, filter: FilterMetadata): void {
    this.filterSearch.emit({
      term: event.term,
      filter: filter.formControlName,
    });
  }

  protected clearFilters(): void {
    if (this.scope()) {
      this.store.dispatch(new ClearFilter({ type: this.scope() }));
    }
    this.form.reset();
    this.filterChange.emit({} as T);
  }

  protected toggleFilters(): void {
    this.showAllFilters.set(!this.showAllFilters());
  }

  protected getFormControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  private updateFilters(): void {
    if (this.form) {
      this.form = this.filtersService.createForm(this.filters());
      this.populateFiltersFromUrl();
      this.initFilters();
    }
  }

  private initializeForm(): void {
    this.form = this.filtersService.createForm(this.filters());
    this.populateFiltersFromUrl();
  }

  private loadFiltersFromState(): void {
    const savedFilters = this.store.selectSnapshot(FiltersSelectors.getFiltersByType(this.type()));

    if (savedFilters && Object.keys(savedFilters).length > 0) {
      this.form.patchValue(savedFilters, { emitEvent: false });
      this.updateFilledFilters();
    }
  }

  private subscribeToLanguageChanges(): void {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => this.updateFilledFilters());
  }

  private initFilters(): void {
    const subscription = this.form.valueChanges
      .pipe(debounceTime(350))
      .subscribe(async (value: Record<string, unknown>) => {
        const isInInitialState = this.checkIfInInitialState(value);
        const urlParamsNotInForm = await this.getUrlParamsNotInForm();
        const formValues = this.getFormValues(value);

        if (isInInitialState) {
          this.handleInitialState(formValues, urlParamsNotInForm);
        } else {
          this.handleNonInitialState(formValues, urlParamsNotInForm);
        }
      });

    this.formChangeSubscriptions.push(subscription);
  }

  private checkIfInInitialState(value: Record<string, unknown>): boolean {
    const defaultValues = this.filtersService.createDefaultFormValues(this.filters());
    return Object.entries(value).every(([key, val]) => this.equalsDefaultValues(key, val, defaultValues));
  }

  private async getUrlParamsNotInForm(): Promise<Record<string, unknown>> {
    const queryParams = await firstValueFrom(this.route.queryParams);
    const formControlNames = Object.keys(this.filtersService.createDefaultFormValues(this.filters()));
    return Object.fromEntries(Object.entries(queryParams).filter(([key]) => !formControlNames.includes(key)));
  }

  private getFormValues(value: Record<string, unknown>): Record<string, unknown> {
    const defaultFormValues = this.filtersService.createDefaultFormValues(this.filters());
    return Object.fromEntries(
      Object.keys(defaultFormValues).map(key => {
        const filter = this.filters().find(f => f.formControlName === key);
        const raw = value[key] ?? '';
        if (filter?.type === FilterTypeEnum.Date && raw) {
          return [key, this.formatDateOnly(raw)];
        }
        return [key, raw];
      }),
    );
  }

  private formatDateOnly(value: unknown): string {
    const date = value instanceof Date ? value : new Date(value as string);
    if (Number.isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private handleNonInitialState(
    formValues: Record<string, unknown>,
    urlParamsNotInForm: Record<string, unknown>,
  ): void {
    this.store.dispatch(new SavePartial({ type: this.type(), value: formValues }));
    this.updateUrlAndEmitChanges(formValues, urlParamsNotInForm);
  }

  private handleInitialState(formValues: Record<string, unknown>, urlParamsNotInForm: Record<string, unknown>): void {
    this.store.dispatch(new ClearPartial({ type: this.type(), keys: Object.keys(formValues) }));
    this.updateUrlAndEmitChanges(this.filtersService.createDefaultFormValues(this.filters()), urlParamsNotInForm);
  }

  private updateUrlAndEmitChanges(
    formValues: Record<string, unknown>,
    urlParamsNotInForm: Record<string, unknown>,
  ): void {
    this.router
      .navigate(['.'], {
        relativeTo: this.route,
        queryParams: { ...urlParamsNotInForm, ...formValues },
        replaceUrl: true,
      })
      .then(() => {
        this.emitFormValueChange(formValues);
        this.updateFilledFilters();
      });
  }

  private populateFiltersFromUrl(): void {
    const queryParams = this.route.snapshot.queryParams;
    const filterComponentFormValues = this.createFilterComponentFormValues(queryParams);
    this.form.patchValue(filterComponentFormValues);
    this.updateFilledFilters();
  }

  private createFilterComponentFormValues(queryParams: Record<string, unknown>): Record<string, unknown> {
    const defaultFormValues = this.filtersService.createDefaultFormValues(this.filters());
    return Object.entries(defaultFormValues).reduce(
      (acc, [key, defaultValue]) => {
        const filter = this.filters().find(f => f.formControlName === key);
        acc[key] = this.getFilterValue(filter, queryParams[key], defaultValue);
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }

  private getFilterValue(filter: FilterMetadata | undefined, queryParamValue: unknown, defaultValue: unknown): unknown {
    if (filter?.type === FilterTypeEnum.EditableMultiSelect) {
      return this.getMultiSelectValue(queryParamValue);
    }
    if (filter?.type === FilterTypeEnum.Date && queryParamValue) {
      const d = new Date(queryParamValue as string);
      return Number.isNaN(d.getTime()) ? (defaultValue ?? null) : d;
    }
    return typeof defaultValue === 'number'
      ? Number.parseInt(queryParamValue as string)
      : (queryParamValue ?? defaultValue);
  }

  private getMultiSelectValue(value: unknown): number[] {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map(Number);
    }
    if (typeof value === 'string') {
      return value.split(',').map(Number);
    }
    return [];
  }

  private emitFormValueChange(formValue: Record<string, unknown>): void {
    this.filterChange.emit({ ...this.form.value, ...formValue } as T);
  }

  private equalsDefaultValues(key: string, value: unknown, defaultFormValues: Record<string, unknown>): boolean {
    return Array.isArray(value)
      ? this.arrayEquals(value, defaultFormValues[key] as unknown[])
      : value == defaultFormValues[key];
  }

  private arrayEquals(arr1: unknown[], arr2: unknown[]): boolean {
    return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
  }

  private updateFilledFilters(): void {
    const formValue = this.form.value;
    const defaultValues = this.filtersService.createDefaultFormValues(this.filters());

    const newFilledFilters = Object.entries(formValue)
      .filter(([key, value]) => {
        const filterMetadata = this.filters().find(f => f.formControlName === key);
        const isDefaultValue = this.equalsDefaultValues(key, value, defaultValues);
        const isEmpty =
          value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0);
        return filterMetadata && !isEmpty && !isDefaultValue;
      })
      .map(([key, value]) => this.createFilterValue(key, value));

    this.filledFilters.set(newFilledFilters);
  }

  private createFilterValue(key: string, value: unknown): FilterValue {
    const filterMetadata = this.filters().find(f => f.formControlName === key);

    if (Array.isArray(value) && filterMetadata?.type === FilterTypeEnum.EditableMultiSelect) {
      return {
        id: key,
        value: this.getMultiSelectNames(filterMetadata, value),
      };
    }

    if (filterMetadata?.type === FilterTypeEnum.Date && value) {
      return { id: key, value: this.formatDateOnly(value) };
    }

    const options = filterMetadata?.options ?? [];
    return { id: key, value: this.translateOptionValue(options, value) };
  }

  private getMultiSelectNames(filterMetadata: FilterMetadata, value: unknown[]): string {
    return value
      .map(id => {
        const option = filterMetadata.multiselectOptions?.find(opt => opt.id === id);
        return option ? option.name : String(id);
      })
      .join(', ');
  }

  private translateOptionValue(options: { value: unknown; label: string }[], value: unknown): string {
    const foundOption = options.find(option => option.value == value);
    return foundOption ? this.translateService.instant(foundOption.label) : String(value);
  }

  private unsubscribeAll(): void {
    this.formChangeSubscriptions.forEach(sub => sub.unsubscribe());
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }
}
