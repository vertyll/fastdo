import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowDownTray, heroArrowPath, heroArrowUpTray, heroPencil } from '@ng-icons/heroicons/outline';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BadgeComponent } from '../shared/components/atoms/badge.component';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { CheckboxComponent } from '../shared/components/atoms/checkbox.component';
import { PaginatorComponent } from '../shared/components/atoms/paginator.component';
import { SpinnerComponent } from '../shared/components/atoms/spinner.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { CustomDatePipe } from '../shared/pipes/custom-date.pipe';
import { FilterGroupComponent } from '../shared/components/organisms/filter-group.component';
import { FilterMetadata, PaginationParams } from '../shared/defs/filter.defs';
import { ButtonRoleEnum, ModalSizeEnum } from '../shared/enums/modal.enum';
import { FilterTypeEnum } from '../shared/enums/filter-type.enum';
import { ModalService } from '../shared/services/modal.service';
import { NotificationService } from '../shared/services/notification.service';
import { EditTarget, TranslationEditPanelComponent } from './components/translation-edit-panel.component';
import { TranslationAdminApiService } from './data-access/translation-admin.api.service';
import { ImportReport, TranslationKeyDetails, TranslationValue } from './defs/translation.defs';

type TranslationFilters = {
  searchTerm?: string;
  sourceService?: string;
  onlyMissing?: boolean;
};

@Component({
  selector: 'app-translations-page',
  imports: [
    TranslatePipe,
    CustomDatePipe,
    NgIconComponent,
    BadgeComponent,
    ButtonComponent,
    CheckboxComponent,
    FilterGroupComponent,
    PaginatorComponent,
    SpinnerComponent,
    TitleComponent,
  ],
  viewProviders: [provideIcons({ heroArrowDownTray, heroArrowUpTray, heroArrowPath, heroPencil })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <app-title [text]="'Admin.translations' | translate" />

        <div class="flex flex-wrap items-center gap-2">
          @if (selectedKeys().size > 0) {
            <app-button (clicked)="editSelected()">
              <ng-icon name="heroPencil" size="16" />
              {{ 'Admin.editSelected' | translate: { count: selectedKeys().size } }}
            </app-button>
          }
          <app-button variant="stroked" (clicked)="load()">
            <ng-icon name="heroArrowPath" size="16" />
            {{ 'Admin.refresh' | translate }}
          </app-button>
          <app-button variant="stroked" (clicked)="exportSpreadsheet()">
            <ng-icon name="heroArrowDownTray" size="16" />
            {{ 'Admin.export' | translate }}
          </app-button>
          <app-button (clicked)="fileInput.click()">
            <ng-icon name="heroArrowUpTray" size="16" />
            {{ 'Admin.import' | translate }}
          </app-button>
          <input
            #fileInput
            type="file"
            class="hidden"
            accept=".xlsx"
            (change)="importSpreadsheet($event)"
            [attr.aria-label]="'Admin.import' | translate"
          />
        </div>
      </div>

      <div
        class="rounded-lg border border-border-primary dark:border-dark-border-primary bg-background-secondary dark:bg-dark-background-secondary px-4 py-3"
      >
        <app-filter-group
          [filters]="filterMetadata"
          type="translations"
          scope="admin"
          [collapsible]="true"
          [totalResults]="total()"
          (filterChange)="onFilterChange($event)"
        />
      </div>

      @if (report(); as importReport) {
        <div
          class="rounded-md border border-border-primary dark:border-dark-border-primary p-4 text-sm space-y-1 bg-surface-secondary dark:bg-dark-surface-secondary"
        >
          <p class="font-semibold text-text-primary dark:text-dark-text-primary">
            {{ 'Admin.importApplied' | translate: { count: importReport.applied } }}
          </p>
          @if (importReport.skippedUnknownKeys.length) {
            <p class="text-text-secondary dark:text-dark-text-secondary">
              {{ 'Admin.importUnknownKeys' | translate }}: {{ importReport.skippedUnknownKeys.join(', ') }}
            </p>
          }
          @if (importReport.skippedUnknownLanguages.length) {
            <p class="text-text-secondary dark:text-dark-text-secondary">
              {{ 'Admin.importUnknownLanguages' | translate }}: {{ importReport.skippedUnknownLanguages.join(', ') }}
            </p>
          }
          @for (rejected of importReport.rejectedPatterns; track rejected.key + rejected.language) {
            <p class="text-danger-500">{{ rejected.key }} [{{ rejected.language }}]: {{ rejected.reason }}</p>
          }
          @if (importReport.missingAfterImport.length) {
            <p class="text-warning-600 dark:text-warning-400">
              {{ 'Admin.importMissing' | translate: { count: importReport.missingAfterImport.length } }}:
              {{ missingSummary(importReport) }}
            </p>
          }
        </div>
      }

      @if (loading()) {
        <div class="flex justify-center py-16"><app-spinner /></div>
      } @else if (failed()) {
        <p class="py-16 text-center text-danger-500">{{ 'Admin.loadError' | translate }}</p>
      } @else if (keys().length === 0) {
        <p class="py-16 text-center text-text-secondary dark:text-dark-text-secondary">
          {{ 'Admin.noKeys' | translate }}
        </p>
      } @else {
        <div class="px-4">
          <app-checkbox
            class="-ml-[11px]"
            [control]="selectAllControl"
            id="selectAllKeys"
            [label]="'Admin.selectAll' | translate"
            (changed)="toggleSelectAll($event.checked)"
          />
        </div>

        <ul class="space-y-3">
          @for (entry of keys(); track entry.key) {
            <li
              class="rounded-md border border-border-primary dark:border-dark-border-primary bg-background-secondary dark:bg-dark-background-secondary p-4"
            >
              <div class="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div class="grid grid-cols-[3rem_1fr] items-center gap-3 min-w-0">
                  <app-checkbox
                    class="-ml-[11px]"
                    [control]="selectionControl(entry.key)"
                    [id]="'select-' + entry.key"
                  />
                  <span class="font-mono text-sm text-text-primary dark:text-dark-text-primary break-all">
                    {{ entry.key }}
                  </span>
                </div>
                <span class="text-xs text-text-secondary dark:text-dark-text-secondary">{{ entry.sourceService }}</span>
              </div>

              <div class="space-y-2">
                @for (value of entry.values; track value.language) {
                  <div class="grid grid-cols-1 sm:grid-cols-[3rem_1fr_auto] items-center gap-3">
                    <span class="text-xs font-semibold uppercase text-text-secondary dark:text-dark-text-secondary">
                      {{ value.language }}
                    </span>
                    <span class="text-sm text-text-primary dark:text-dark-text-primary break-words">
                      {{ value.effectiveValue || ('Admin.missing' | translate) }}
                    </span>
                    <div class="flex items-center gap-1 justify-end">
                      @if (value.isOverridden) {
                        <app-badge variant="accent">{{ 'Admin.overridden' | translate }}</app-badge>
                        <app-button
                          variant="icon"
                          [title]="'Admin.restoreDefault' | translate"
                          (clicked)="clearOverride(entry.key, value.language)"
                        >
                          <ng-icon name="heroArrowPath" size="16" />
                        </app-button>
                      }
                      <app-button variant="icon" [title]="'Basic.edit' | translate" (clicked)="editOne(entry, value)">
                        <ng-icon name="heroPencil" size="16" />
                      </app-button>
                    </div>
                  </div>
                }
              </div>

              <p class="mt-3 text-right text-[11px] text-text-secondary dark:text-dark-text-secondary">
                {{ 'Admin.createdAt' | translate }}: {{ entry.createdAt | customDate: 'dd.MM.yyyy HH:mm' }} ·
                {{ 'Admin.updatedAt' | translate }}: {{ entry.updatedAt | customDate: 'dd.MM.yyyy HH:mm' }}
              </p>
            </li>
          }
        </ul>

        <app-paginator
          [total]="total()"
          [pageSize]="pageSize()"
          [currentPage]="page()"
          (pageChange)="onPageChange($event)"
        />
      }
    </div>
  `,
})
export class TranslationsPageComponent implements OnInit {
  private readonly api = inject(TranslationAdminApiService);
  private readonly translateService = inject(TranslateService);
  private readonly notificationService = inject(NotificationService);
  private readonly modalService = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly keys = signal<TranslationKeyDetails[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly report = signal<ImportReport | null>(null);
  protected readonly selectedKeys = signal<ReadonlySet<string>>(new Set());
  protected readonly total = signal(0);
  protected readonly page = signal(0);
  protected readonly pageSize = signal(25);

  protected readonly filterMetadata: FilterMetadata[] = [
    { type: FilterTypeEnum.Text, formControlName: 'searchTerm', labelKey: 'Admin.searchKeys' },
    { type: FilterTypeEnum.Text, formControlName: 'sourceService', labelKey: 'Admin.sourceService' },
    {
      type: FilterTypeEnum.Select,
      formControlName: 'onlyMissing',
      labelKey: 'Admin.onlyMissing',
      defaultValue: false,
      options: [
        { value: false, label: 'Admin.allKeys' },
        { value: true, label: 'Admin.onlyMissing' },
      ],
    },
  ];

  protected readonly selectAllControl = new FormControl(false, { nonNullable: true });

  private readonly selectionControls = new Map<string, FormControl<boolean>>();

  protected toggleSelectAll(checked: boolean): void {
    this.keys().forEach(entry => this.selectionControl(entry.key).setValue(checked));
  }
  private filters: TranslationFilters = {};
  private editPanel: TranslationEditPanelComponent | null = null;

  public ngOnInit(): void {
    this.load();
  }

  protected selectionControl(key: string): FormControl<boolean> {
    const existing = this.selectionControls.get(key);
    if (existing) {
      return existing;
    }

    const created = new FormControl(false, { nonNullable: true });
    created.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(checked => {
      this.selectedKeys.update(current => {
        const next = new Set(current);
        if (checked) {
          next.add(key);
        } else {
          next.delete(key);
        }
        return next;
      });
    });
    this.selectionControls.set(key, created);
    return created;
  }

  protected onFilterChange(values: TranslationFilters): void {
    this.filters = values;
    this.page.set(0);
    this.load();
  }

  protected onPageChange(params: PaginationParams): void {
    this.page.set(params.page);
    this.pageSize.set(params.pageSize);
    this.load();
  }

  protected missingSummary(report: ImportReport): string {
    return report.missingAfterImport
      .slice(0, 10)
      .map(missing => `${missing.key} [${missing.language}]`)
      .join(', ');
  }

  protected editOne(entry: TranslationKeyDetails, value: TranslationValue): void {
    this.openEditor([
      {
        key: entry.key,
        language: value.language,
        defaultValue: value.defaultValue,
        effectiveValue: value.effectiveValue,
        version: value.version,
      },
    ]);
  }

  protected editSelected(): void {
    const selected = this.selectedKeys();
    const targets = this.keys()
      .filter(entry => selected.has(entry.key))
      .flatMap(entry =>
        entry.values.map(value => ({
          key: entry.key,
          language: value.language,
          defaultValue: value.defaultValue,
          effectiveValue: value.effectiveValue,
          version: value.version,
        })),
      );

    if (targets.length) {
      this.openEditor(targets);
    }
  }

  protected clearOverride(key: string, language: string): void {
    this.api
      .clearOverride(key, language)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.load(),
      });
  }

  protected exportSpreadsheet(): void {
    this.api
      .exportSpreadsheet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'translations.xlsx';
          link.click();
          URL.revokeObjectURL(url);
        },
      });
  }

  protected importSpreadsheet(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.api
      .importSpreadsheet(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: report => {
          input.value = '';
          this.report.set(report);
          this.load();
        },
        error: () => {
          input.value = '';
        },
      });
  }

  protected load(): void {
    this.loading.set(true);
    this.failed.set(false);
    this.api
      .searchKeys({
        searchTerm: this.filters.searchTerm || undefined,
        sourceService: this.filters.sourceService || undefined,
        onlyMissing: this.filters.onlyMissing ?? false,
        page: this.page(),
        size: this.pageSize(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: page => {
          this.loading.set(false);
          this.keys.set(page.items);
          this.total.set(page.pagination.total);
          this.selectAllControl.setValue(false, { emitEvent: false });
        },
        error: () => {
          this.loading.set(false);
          this.failed.set(true);
        },
      });
  }

  private openEditor(targets: EditTarget[]): void {
    this.editPanel = null;

    this.modalService.present({
      title: this.translateService.instant(targets.length > 1 ? 'Admin.editSelectedTitle' : 'Admin.editTitle'),
      size: ModalSizeEnum.Large,
      components: [
        {
          component: TranslationEditPanelComponent,
          data: { targets, register: (panel: TranslationEditPanelComponent) => (this.editPanel = panel) },
        },
      ],
      buttons: [
        { role: ButtonRoleEnum.Cancel, text: this.translateService.instant('Basic.cancel') },
        {
          role: ButtonRoleEnum.Ok,
          text: this.translateService.instant('Basic.save'),
          handler: () => this.saveEdits(),
        },
      ],
    });
  }

  private saveEdits(): boolean {
    const edited = this.editPanel?.collect();
    if (!edited) {
      return false;
    }

    forkJoin(
      edited.map(target =>
        this.api
          .override(target.key, target.language, target.effectiveValue ?? '', target.version)
          .pipe(catchError(() => of(null))),
      ),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(results => {
        const failed = results.filter(result => result === null).length;
        if (failed) {
          this.notificationService.error('Admin.saveError');
        }
        this.load();
      });

    return true;
  }
}
