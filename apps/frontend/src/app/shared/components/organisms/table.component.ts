import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ContentChild,
  ElementRef,
  OnDestroy,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCalendar, heroEye, heroPencil, heroTrash, heroXMark } from '@ng-icons/heroicons/outline';
import { TranslateModule } from '@ngx-translate/core';
import { CustomDatePipe } from '../../pipes/custom-date.pipe';
import { PlatformService } from '../../services/platform.service';
import { ThemeService } from '../../services/theme.service';
import { ImageComponent } from './image.component';
import { SpinnerComponent } from '../atoms/spinner.component';
import { ThemeEnum } from '../../enums/theme.enum';
import { FilterGroupComponent } from './filter-group.component';
import { PaginatorComponent } from '../atoms/paginator.component';

/**
 * Table configuration reference
 * -----------------------------
 *
 * `TableConfig` is the top-level object consumed by `<app-table>`. It describes
 * which columns to render, what row-level actions are available and how the
 * table should behave (sorting, pagination, hover highlighting, horizontal
 * scroll, infinite scroll, etc.).
 *
 * `TableColumn` describes a single column: its key in the row object, the
 * header label (translation key), the cell type and optional presentation
 * hints (width, alignment, responsive visibility, text truncation).
 *
 * `TruncateConfig` is an opt-in object attached to a column: when omitted the
 * cell renders full text with no width limit and no "show more" button; when
 * provided (even as an empty `{}`), text truncation is enabled with sensible
 * defaults — use `maxChars`, `maxLines` or `maxWidth` to tune it and
 * `expandable: false` to hide the toggle button.
 *
 * `TableAction` describes a row-level action rendered in the sticky actions
 * column (view / edit / delete / custom). Use `visible` and `disabled`
 * predicates to control per-row availability.
 */
export interface TruncateConfig {
  /** Maximum number of characters used to size the cell (CSS `ch` unit)
   *  and to decide whether the "show more / show less" toggle is needed. */
  maxChars?: number;
  /** Maximum number of lines shown in the collapsed state (CSS `-webkit-line-clamp`). */
  maxLines?: number;
  /** Explicit CSS `max-width` for the cell (e.g. `'24rem'`, `'400px'`).
   *  Takes precedence over `maxChars`. */
  maxWidth?: string;
  /** Whether the "show more / show less" toggle button is rendered. Defaults to `true`. */
  expandable?: boolean;
}

export interface TableColumn {
  /** Property name on the row object whose value is rendered in this column. */
  key: string;
  /** Translation key used as the column header. */
  label: string;
  /** Cell renderer type. `custom` delegates rendering to a named template. */
  type: 'text' | 'boolean' | 'date' | 'image' | 'custom';
  /** Enables clicking on the header to sort by this column. */
  sortable?: boolean;
  /** Preferred column width, used as a `min-width` hint on the header. */
  width?: string | number;
  /** Name of a `<ng-template>` passed via content projection (only for `type: 'custom'`). */
  customTemplate?: string;
  /** Text truncation config. Omit to render full text without a toggle button. */
  truncate?: TruncateConfig;
  /** Horizontal text alignment inside the cell. */
  align?: 'left' | 'center' | 'right';
  /** Vertical alignment inside the cell. */
  verticalAlign?: 'top' | 'middle' | 'bottom';
  /** Hides the column on the given breakpoint and below. */
  hideOn?: 'mobile' | 'tablet';
  /** Display priority (1 = highest). Lower-priority columns are hidden first on narrow screens. */
  priority?: number;
}

export interface TableAction {
  /** Stable identifier emitted via `(action)` when the action is triggered. */
  key: string;
  /** Translation key used for the tooltip / accessible label. */
  label: string;
  /** Optional icon name rendered inside the action button. */
  icon?: string;
  /** Visual variant of the action button. */
  color?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  /** Predicate controlling whether the action is rendered for a given row. */
  visible?: (row: any) => boolean;
  /** Predicate controlling whether the action is disabled for a given row. */
  disabled?: (row: any) => boolean;
}

export interface TableRow {
  [key: string]: any;
}

export interface TableConfig {
  /** Columns rendered in the table, in order. */
  columns: TableColumn[];
  /** Row-level actions rendered in the sticky column. */
  actions?: TableAction[];
  /** Adds a leading checkbox column for row selection. */
  selectable?: boolean;
  /** Enables header click sorting (per-column sort still requires `column.sortable`). */
  sortable?: boolean;
  /** Enables pagination controls. */
  paginated?: boolean;
  /** Alternates background color for even rows (zebra striping). */
  striped?: boolean;
  /** Highlights the row under the cursor. */
  hover?: boolean;
  /** Enables horizontal scroll when the content does not fit the container. */
  scrollable?: boolean;
  /** Viewport width (px) below which responsive rules apply. */
  responsiveBreakpoint?: number;
  /** Enables emitting a `loadMore` event when the user scrolls near the bottom. */
  infiniteScroll?: boolean;
  /** Shows the inline spinner at the bottom while more rows are being loaded. */
  loadingMore?: boolean;
  /** Function returning extra CSS class(es) for a given row. */
  rowClassFunction?: (row: any) => string;
  /** Integrated filter definitions (empty/undefined disables integrated filters). */
  filters?: any[];
  /** Identifier type for the integrated filters to load saved state */
  filterType?: string;
  /** Identifier scope for the integrated filters to clear state */
  filterScope?: string;
  /** Shows the collapsible toggle for integrated filters */
  collapsibleFilters?: boolean;
  /** Enables integrated pagination (requires pagination state input). */
  integratedPagination?: boolean;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    ImageComponent,
    NgIconComponent,
    TranslateModule,
    CustomDatePipe,
    SpinnerComponent,
    FilterGroupComponent,
    PaginatorComponent,
  ],
  providers: [
    provideIcons({
      heroCalendar,
      heroXMark,
      heroPencil,
      heroEye,
      heroTrash,
    }),
  ],
  template: `
    <div
      class="table-wrapper flex flex-col gap-0 rounded-lg border border-border-primary dark:border-dark-border-primary bg-background-primary dark:bg-dark-background-primary shadow-sm overflow-hidden"
    >
      @if (config().filters?.length) {
        <div
          class="table-filters border-b border-border-primary dark:border-dark-border-primary bg-background-secondary dark:bg-dark-background-secondary px-4 py-3"
        >
          <app-filter-group
            [filters]="config().filters || []"
            [type]="config().filterType || ''"
            [scope]="config().filterScope || ''"
            [collapsible]="config().collapsibleFilters ?? true"
            [totalResults]="config().integratedPagination || config().infiniteScroll ? undefined : total()"
            (filterChange)="filterChange.emit($event)"
          />
        </div>
      }

      @if (loading() && !data().length) {
        <div class="state-overlay static! border-b border-border-primary dark:border-dark-border-primary min-h-75">
          <app-spinner />
          <span>{{ 'Basic.loading' | translate }}</span>
        </div>
      } @else if (!data().length) {
        <div
          class="state-overlay no-data-state static! border-b border-border-primary dark:border-dark-border-primary min-h-75"
        >
          <p>
            {{ noResultsMessage() | translate }}
          </p>
        </div>
      } @else {
        <div
          #tableScrollContainer
          class="table-container"
          [class.mobile-view]="isMobile()"
          [class.dark]="isDarkMode()"
          [class.is-scrolled-x]="isScrolledX()"
          [class.is-at-end-x]="isAtEndX()"
          [ngStyle]="getTableContainerStyle()"
          (scroll)="onTableScroll($event)"
        >
          <table
            mat-table
            matSort
            [matSortActive]="currentSort?.column || ''"
            [matSortDirection]="currentSort?.direction || ''"
            (matSortChange)="onMatSortChange($event)"
            [dataSource]="data()"
            class="responsive-table w-full"
          >
            @if (config().selectable) {
              <ng-container matColumnDef="select">
                <th mat-header-cell *matHeaderCellDef class="select-column">
                  <mat-checkbox
                    (change)="toggleSelectAll($event)"
                    [checked]="isAllSelected()"
                    [indeterminate]="isIndeterminate()"
                    color="primary"
                  ></mat-checkbox>
                </th>
                <td mat-cell *matCellDef="let row" class="select-cell">
                  <mat-checkbox
                    (change)="toggleSelection(row)"
                    (click)="$event.stopPropagation()"
                    [checked]="isSelected(row)"
                    color="primary"
                  ></mat-checkbox>
                </td>
              </ng-container>
            }
            @for (column of config().columns; track column.key) {
              <ng-container [matColumnDef]="column.key">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  [class]="getHeaderClass(column)"
                  [style.min-width]="getColumnWidth(column)"
                  [mat-sort-header]="column.sortable && config().sortable ? column.key : ''"
                  [disabled]="!(column.sortable && config().sortable)"
                >
                  {{ column.label | translate }}
                </th>
                <td mat-cell *matCellDef="let row" [class]="getCellClass(column)" [attr.data-column]="column.key">
                  @switch (column.type) {
                    @case ('text') {
                      @if (column.truncate) {
                        <div
                          class="text-cell"
                          [class.expandable]="shouldShowExpandButton(row, column.key, column)"
                          [ngStyle]="getTextCellStyle(column)"
                        >
                          <div
                            class="text-content truncated"
                            [class.expanded]="isTextExpanded(row, column.key)"
                            [style.--max-lines]="getMaxLines(column)"
                            [title]="getValue(row, column.key)"
                            [attr.data-truncate-key]="getRowId(row) + '__' + column.key"
                          >
                            {{ getDisplayedText(row, column) }}
                          </div>
                          @if (isExpandable(column) && shouldShowExpandButton(row, column.key, column)) {
                            <span
                              (click)="toggleTextExpansion(row, column.key, $event)"
                              (keydown.enter)="toggleTextExpansion(row, column.key, $event)"
                              (keydown.space)="toggleTextExpansion(row, column.key, $event); $event.preventDefault()"
                              class="expand-link"
                              role="button"
                              tabindex="0"
                              [attr.aria-label]="
                                isTextExpanded(row, column.key)
                                  ? ('Basic.showLess' | translate)
                                  : ('Basic.showMore' | translate)
                              "
                            >
                              {{
                                isTextExpanded(row, column.key)
                                  ? ('Basic.showLess' | translate)
                                  : ('Basic.showMore' | translate)
                              }}
                            </span>
                          }
                        </div>
                      } @else {
                        <span class="simple-text">{{ getValue(row, column.key) || '-' }}</span>
                      }
                    }
                    @case ('boolean') {
                      <span class="boolean-cell">{{
                        getValue(row, column.key) ? ('Basic.yes' | translate) : ('Basic.no' | translate)
                      }}</span>
                    }
                    @case ('date') {
                      <span class="date-cell">{{ (getValue(row, column.key) | customDate) || '-' }}</span>
                    }
                    @case ('image') {
                      <div class="image-cell">
                        <app-image
                          [initialUrl]="getValue(row, column.key)"
                          format="square"
                          size="sm"
                          mode="preview"
                          (click)="$event.stopPropagation(); projectImageClick.emit(row)"
                        />
                      </div>
                    }
                    @case ('custom') {
                      <div class="custom-cell">
                        <ng-container
                          *ngTemplateOutlet="
                            getCustomTemplate(column.customTemplate);
                            context: { $implicit: row, column: column }
                          "
                        ></ng-container>
                      </div>
                    }
                  }
                </td>
              </ng-container>
            }
            @if (config().actions?.length) {
              <ng-container matColumnDef="actions" stickyEnd>
                <th mat-header-cell *matHeaderCellDef class="actions-header actions-sticky">
                  {{ 'Basic.actions' | translate }}
                </th>
                <td mat-cell *matCellDef="let row" class="actions-cell actions-sticky">
                  <div class="actions-container">
                    @for (action of config().actions; track action.key) {
                      @if (isActionVisible(action, row)) {
                        <button
                          [disabled]="isActionDisabled(action, row)"
                          (click)="$event.stopPropagation(); executeAction(action.key, row)"
                          [class]="getActionButtonClass(action)"
                          [attr.aria-label]="action.label | translate"
                        >
                          @if (action.icon) {
                            <ng-icon [name]="action.icon" size="1.125rem" />
                          } @else {
                            <span>{{ action.label | translate }}</span>
                          }
                        </button>
                      }
                    }
                  </div>
                </td>
              </ng-container>
            }

            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: displayedColumns"
              [class]="getRowClass(row)"
              (click)="onRowClick(row)"
            ></tr>
          </table>
        </div>
      }

      @if (config().integratedPagination) {
        <div
          class="table-pagination bg-background-secondary dark:bg-dark-background-secondary border-t border-border-primary dark:border-dark-border-primary px-4 py-1"
        >
          <app-paginator
            [total]="total()"
            [pageSize]="pageSize()"
            [currentPage]="currentPage()"
            [pageSizeOptions]="pageSizeOptions()"
            (pageChange)="pageChange.emit($event)"
          />
        </div>
      } @else if (config().infiniteScroll) {
        <div
          class="table-pagination bg-background-secondary dark:bg-dark-background-secondary border-t border-border-primary dark:border-dark-border-primary px-4 py-1"
        >
          <app-paginator
            [showOnlyTotal]="true"
            [total]="total()"
            [pageSize]="pageSize()"
            [currentPage]="currentPage()"
          />
        </div>
      }
    </div>

    @if (config().infiniteScroll && config().loadingMore) {
      <div class="loading-more-overlay">
        <div class="loading-more-content">
          <app-spinner />
          <span class="loading-more-text">{{ 'Basic.loadingMore' | translate }}</span>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .mat-mdc-header-cell.mat-mdc-table-sticky,
      .mat-mdc-header-row.mat-mdc-table-sticky {
        z-index: 10 !important;
      }

      .state-overlay {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        min-height: 70px;
        color: var(--app-table-state-text);
        background-color: var(--app-table-state-bg);
        border-color: var(--app-table-state-border);
      }

      .no-data-state {
        border-radius: 0.5rem;
        border: 1px solid var(--app-table-border);
        background-color: var(--app-table-row-bg);
      }

      .table-container {
        width: 100%;
        overflow-y: auto;
        overflow-x: auto;
        position: relative;
      }

      .responsive-table {
        width: max-content;
        min-width: 100%;
        table-layout: auto;
      }

      .select-column {
        width: 3.5rem;
        min-width: 3.5rem;
      }

      .actions-header {
        width: 8rem;
        min-width: 8rem;
      }

      :host .mat-mdc-header-cell {
        font-weight: 600;
        color: var(--app-table-header-text);
        border-bottom: 1px solid var(--app-table-border);
        z-index: 1;
        background-color: var(--app-table-header-bg);
      }

      .header-center {
        text-align: center;
      }

      .header-right {
        text-align: right;
      }

      .header-left {
        text-align: left;
      }

      .header-center ::ng-deep .mat-sort-header-container {
        justify-content: center;
      }
      .header-right ::ng-deep .mat-sort-header-container {
        justify-content: flex-end;
      }
      .header-left ::ng-deep .mat-sort-header-container {
        justify-content: flex-start;
      }

      .mat-mdc-header-row {
        z-index: 1;
      }

      .mat-mdc-cell {
        border-bottom: 1px solid var(--app-table-border-soft);
        color: var(--app-table-cell-text);
        padding: 0.75rem 1rem;
        vertical-align: top;
        white-space: nowrap;
      }

      :host .mat-mdc-header-cell {
        white-space: nowrap;
      }

      .mat-mdc-cell:has(.text-cell),
      .mat-mdc-cell:has(.simple-text),
      .mat-mdc-cell:has(.custom-cell) {
        white-space: normal;
      }

      .cell-center {
        text-align: center;
      }
      .cell-right {
        text-align: right;
      }
      .cell-middle {
        vertical-align: middle;
      }
      .cell-bottom {
        vertical-align: bottom;
      }

      :host .select-column,
      .select-cell {
        text-align: center;
        vertical-align: middle;
        width: 3.5rem;
        min-width: 3.5rem;
        max-width: 3.5rem;
        padding-left: 0;
        padding-right: 0;
      }

      .text-cell {
        position: relative;
        margin-inline: 0;
        text-align: inherit;
      }

      .cell-center .text-cell,
      .cell-center.text-cell {
        margin-inline: auto;
      }
      .cell-right .text-cell,
      .cell-right.text-cell {
        margin-inline-start: auto;
        margin-inline-end: 0;
      }

      .text-content {
        --max-lines: 2;
        word-wrap: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
        line-height: 1.5;
      }

      .text-content.truncated {
        display: -webkit-box;
        -webkit-line-clamp: var(--max-lines);
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .text-content.expanded {
        display: block;
      }

      .simple-text {
        word-wrap: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
      }

      .expand-link {
        display: inline-block;
        margin-top: 0.25rem;
        margin-left: 0.25rem;
        padding: 0.125rem 0.25rem;
        color: var(--app-table-accent);
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        border-radius: 0.25rem;
        text-decoration: none;
        user-select: none;
      }

      .expand-link:hover {
        color: var(--app-table-accent-hover);
        background-color: var(--app-table-accent-hover-bg);
      }

      .expand-link:active {
        color: var(--app-table-accent-active);
        background-color: var(--app-table-accent-active-bg);
      }

      .boolean-cell {
        font-weight: 500;
      }

      .date-cell {
        font-variant-numeric: tabular-nums;
      }

      .image-cell {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .custom-cell {
        padding: 0.25rem;
      }

      .actions-header {
        text-align: center;
      }

      .actions-cell {
        text-align: center;
        vertical-align: middle;
      }

      .actions-sticky {
        position: sticky;
        right: 0;
        z-index: 2;
        background-color: var(--app-table-row-bg);
        background-clip: padding-box;
      }

      th.actions-sticky {
        background-color: var(--app-table-header-bg);
        z-index: 3;
      }

      .table-container .actions-sticky::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 1px;
        background-color: var(--app-table-border);
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
      }

      .table-container .actions-sticky::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 12px;
        transform: translateX(-100%);
        background: linear-gradient(to left, color-mix(in srgb, var(--app-table-border) 35%, transparent), transparent);
        opacity: 0;
        transition: opacity 0.25s ease;
        pointer-events: none;
      }

      .table-container.is-scrolled-x:not(.is-at-end-x) .actions-sticky::before,
      .table-container.is-scrolled-x:not(.is-at-end-x) .actions-sticky::after {
        opacity: 1;
      }

      .actions-container {
        display: flex;
        gap: 0.25rem;
        justify-content: center;
        align-items: center;
      }

      .action-button {
        padding: 0.5rem;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 2.2rem;
        min-height: 2.2rem;
      }

      .action-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .action-primary {
        color: var(--app-table-action-primary-fg);
        background-color: var(--app-table-action-primary-bg);
      }

      .action-primary:hover:not(:disabled) {
        background-color: var(--app-table-action-primary-hover-bg);
        color: var(--app-table-action-primary-hover-fg);
      }

      .action-secondary {
        color: var(--app-table-action-secondary-fg);
        background-color: var(--app-table-action-secondary-bg);
      }

      .action-secondary:hover:not(:disabled) {
        background-color: var(--app-table-action-secondary-hover-bg);
        color: var(--app-table-action-secondary-hover-fg);
      }

      .action-danger {
        color: var(--app-table-action-danger-fg);
        background-color: var(--app-table-action-danger-bg);
      }

      .action-danger:hover:not(:disabled) {
        background-color: var(--app-table-action-danger-hover-bg);
        color: var(--app-table-action-danger-hover-fg);
      }

      .action-success {
        color: var(--app-table-action-success-fg);
        background-color: var(--app-table-action-success-bg);
      }

      .action-success:hover:not(:disabled) {
        background-color: var(--app-table-action-success-hover-bg);
        color: var(--app-table-action-success-hover-fg);
      }

      .action-warning {
        color: var(--app-table-action-warning-fg);
        background-color: var(--app-table-action-warning-bg);
      }

      .action-warning:hover:not(:disabled) {
        background-color: var(--app-table-action-warning-hover-bg);
        color: var(--app-table-action-warning-hover-fg);
      }

      .sort-button {
        color: var(--app-table-muted-text);
        background: none;
        border-radius: 0.25rem;
        cursor: pointer;
        transition: color 0.2s ease;
      }

      .sort-button:hover {
        color: var(--app-table-accent);
      }

      .mat-mdc-row {
        background-color: var(--app-table-row-bg);
        cursor: pointer;
        transition: background-color 0.15s ease;
      }

      .mat-mdc-row:hover {
        background-color: var(--app-table-row-hover-bg);
      }

      .mat-mdc-row:nth-child(even) {
        background-color: var(--app-table-row-even-bg);
      }

      .mat-mdc-row:nth-child(even):hover {
        background-color: var(--app-table-row-even-hover-bg);
      }

      @media (max-width: 768px) {
        .responsive-table {
          min-width: 100%;
        }

        .text-content {
          font-size: 0.875rem;
          line-height: 1.25;
        }

        .mat-mdc-cell,
        .mat-mdc-header-cell {
          padding: 0.5rem 0.75rem;
        }

        .actions-container {
          gap: 0.125rem;
        }

        .action-button {
          min-width: 1.75rem;
          min-height: 1.75rem;
          padding: 0.375rem;
        }
      }

      @media (max-width: 640px) {
        .responsive-table {
          min-width: 100%;
        }

        .text-content {
          font-size: 0.75rem;
          line-height: 1.1;
        }

        .mat-mdc-cell,
        .mat-mdc-header-cell {
          padding: 0.5rem;
        }

        .expand-link {
          font-size: 0.625rem;
          padding: 0.125rem;
        }
      }

      .loading-more-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--app-table-overlay-bg);
        backdrop-filter: blur(2px);
        z-index: 10;
        pointer-events: none;
      }

      .loading-more-content {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        gap: 0.5rem;
      }

      .loading-more-text {
        font-size: 0.875rem;
        color: var(--app-table-loading-text);
        font-weight: 500;
      }

      .priority-high {
        background-color: var(--app-table-priority-high-bg) !important;
      }

      .priority-high:hover {
        background-color: var(--app-table-priority-high-hover-bg) !important;
      }

      .priority-low {
        background-color: var(--app-table-priority-low-bg) !important;
      }

      .priority-low:hover {
        background-color: var(--app-table-priority-low-hover-bg) !important;
      }
    `,
  ],
})
export class TableComponent implements AfterViewChecked, OnDestroy {
  private readonly themeService = inject(ThemeService);
  private readonly platformService = inject(PlatformService);

  public readonly data = input.required<TableRow[]>();
  public readonly config = input.required<TableConfig>();
  public readonly loading = input(false);
  public readonly customTemplates = input<{ [key: string]: TemplateRef<any> }>({});
  public readonly initialSort = input<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  public readonly height = input<string | null>(null);
  public readonly noResultsMessage = input<string>('Basic.noResults');
  public readonly total = input<number>(0);
  public readonly pageSize = input<number>(10);
  public readonly currentPage = input<number>(0);
  public readonly pageSizeOptions = input<number[]>([10, 25, 50, 100]);

  public readonly selectionChange = output<any[]>();
  public readonly actionClick = output<{ action: string; row: any }>();
  public readonly sortChange = output<{ column: string; direction: 'asc' | 'desc' }>();
  public readonly rowClick = output<any>();
  public readonly projectImageClick = output<any>();
  public readonly loadMore = output<void>();
  public readonly filterChange = output<any>();
  public readonly pageChange = output<any>();

  @ContentChild('customHeader', { static: false })
  public readonly customHeaderTemplate?: TemplateRef<any>;
  @ContentChild('customTemplate')
  public readonly customTemplate!: TemplateRef<any>;

  protected readonly isDarkMode = computed(() => this.themeService.currentTheme === ThemeEnum.Dark);
  protected readonly isMobile = computed(() => this.platformService.isMobile());

  private readonly expandedTexts = signal<ReadonlyMap<string, boolean>>(new Map());
  private readonly overflowMap = signal<ReadonlyMap<string, boolean>>(new Map());

  protected currentSort: { column: string; direction: 'asc' | 'desc' } | null = null;

  private selection: any[] = [];
  private intersectionObserver?: IntersectionObserver;
  private previousDataLength = 0;
  private shouldPreserveScroll = false;

  protected readonly isScrolledX = signal(false);
  protected readonly isAtEndX = signal(true);

  constructor(private readonly elementRef: ElementRef) {
    effect(() => {
      const currentData = this.data();
      const config = this.config();
      const currentDataLength = currentData.length;

      if (currentDataLength > this.previousDataLength && config.loadingMore) {
        this.shouldPreserveScroll = true;
      }

      if (config.infiniteScroll) {
        if (currentDataLength > 0 && !this.intersectionObserver) {
          setTimeout(() => this.initializeInfiniteScroll(), 0);
        } else if (this.intersectionObserver) {
          this.updateInfiniteScrollObserver();
        }
      }

      this.previousDataLength = currentDataLength;
    });

    effect(() => {
      const initialSort = this.initialSort();
      if (initialSort) {
        this.currentSort = initialSort;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  ngAfterViewChecked(): void {
    // Preserve scroll position after view is updated when loading more
    if (this.shouldPreserveScroll) {
      this.shouldPreserveScroll = false;
      // Small delay to ensure the new rows are rendered
      setTimeout(() => {
        this.preserveScrollPosition();
      }, 0);
    }

    // Recalculate horizontal scroll state (e.g. after data/layout changes).
    this.updateHorizontalScrollState();

    // Detect real text overflow to decide whether `show more` button should appear.
    this.updateOverflowState();
  }

  public onTableScroll(event: Event): void {
    const el = event.target as HTMLElement;
    this.applyHorizontalScrollState(el);
  }

  public get displayedColumns(): string[] {
    const columns = [];
    if (this.config().selectable) {
      columns.push('select');
    }

    const visibleColumns = this.config().columns.filter(col => {
      if (col.hideOn === 'mobile' && this.isMobile()) {
        return false;
      }
      return !(col.hideOn === 'tablet' && this.isMobile());
    });

    if (this.isMobile()) {
      visibleColumns.sort((a, b) => (a.priority || 999) - (b.priority || 999));
    }

    columns.push(...visibleColumns.map((col: TableColumn) => col.key));

    if (this.config().actions?.length) {
      columns.push('actions');
    }
    return columns;
  }

  public isSelected(row: any): boolean {
    return this.selection.some(item => this.getRowId(item) === this.getRowId(row));
  }

  public getValue(row: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], row);
  }

  public onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  protected getRowId(row: any): any {
    return row.id || row._id || JSON.stringify(row);
  }

  protected getHeaderClass(column: TableColumn): string {
    const align = column.align || 'left';
    return `header-${align}`;
  }

  protected getCellClass(column: TableColumn): string {
    const horizontalAlign = column.align || 'left';
    const verticalAlign = column.verticalAlign || 'top';
    return `cell-${horizontalAlign} cell-${verticalAlign}`;
  }

  protected getMaxLines(column: TableColumn): number {
    if (column.truncate?.maxLines) {
      return column.truncate.maxLines;
    }

    return this.isMobile() ? 1 : 3;
  }

  protected isExpandable(column: TableColumn): boolean {
    return column.truncate?.expandable !== false;
  }

  protected getTableContainerStyle(): { [key: string]: string } {
    if (this.height()) {
      return { height: this.height()! };
    }

    if (this.config().infiniteScroll && this.data().length > 0) {
      return { 'max-height': '600px' };
    }

    return {};
  }

  protected getColumnWidth(column: TableColumn): string {
    if (!column.width) {
      switch (column.type) {
        case 'image':
          return '5rem';
        case 'boolean':
          return '6rem';
        case 'date':
          return '9rem';
        default:
          return this.isMobile() ? '8rem' : 'auto';
      }
    }

    if (typeof column.width === 'number') {
      if (column.width <= 1) {
        return `${column.width * 100}%`;
      } else {
        return `${column.width}px`;
      }
    }

    return column.width;
  }

  protected toggleTextExpansion(row: any, columnKey: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    const key = `${this.getRowId(row)}-${columnKey}`;
    const current = this.expandedTexts();
    const next = new Map(current);
    next.set(key, !(current.get(key) || false));
    this.expandedTexts.set(next);
  }

  protected shouldShowExpandButton(row: any, columnKey: string, column: TableColumn): boolean {
    if (!column.truncate) return false;

    const text = this.getValue(row, columnKey);
    if (!text) return false;

    // Always show button when user expanded the text (so they can collapse it back).
    if (this.isTextExpanded(row, columnKey)) return true;

    // Hard rule: if maxChars is configured and text exceeds it, always show toggle.
    // (DOM overflow measurement is unreliable here, because max-width is set to `${maxChars}ch`,
    // so the text physically fits — but it IS clamped by line-clamp, so user needs the button.)
    const { maxChars } = column.truncate;
    if (maxChars && text.length > maxChars) return true;

    // Otherwise: real DOM overflow measurement (set in ngAfterViewChecked).
    const key = `${this.getRowId(row)}__${columnKey}`;
    const measured = this.overflowMap().get(key);
    if (measured !== undefined) return measured;

    // Fallback heuristic for the very first render, before measurement happens.
    const maxLines = this.getMaxLines(column);
    const approximateCharsPerLine = this.isMobile() ? 20 : 60;
    return text.length > maxLines * approximateCharsPerLine;
  }

  protected getTextCellStyle(column: TableColumn): { [key: string]: string } {
    const cfg = column.truncate;
    if (!cfg) return {};
    if (cfg.maxWidth) {
      return { 'max-width': cfg.maxWidth };
    }
    if (cfg.maxChars) {
      return { 'max-width': `${cfg.maxChars}ch` };
    }
    return {};
  }

  protected isTextExpanded(row: any, columnKey: string): boolean {
    const key = `${this.getRowId(row)}-${columnKey}`;
    return this.expandedTexts().get(key) || false;
  }

  protected getDisplayedText(row: any, column: TableColumn): string {
    const value = this.getValue(row, column.key);
    if (value === null || value === undefined || value === '') return '-';
    const text = String(value);

    const maxChars = column.truncate?.maxChars;
    if (!maxChars) return text;

    if (this.isTextExpanded(row, column.key)) return text;
    if (text.length <= maxChars) return text;

    return text.slice(0, maxChars) + '…';
  }

  protected toggleSelectAll(event: any): void {
    if (event.checked) {
      this.selection = [...this.data()];
    } else {
      this.selection = [];
    }
    this.selectionChange.emit([...this.selection]);
  }

  protected isAllSelected(): boolean {
    return this.data().length > 0 && this.selection.length === this.data().length;
  }

  protected isIndeterminate(): boolean {
    return this.selection.length > 0 && this.selection.length < this.data().length;
  }

  protected onMatSortChange(sort: Sort): void {
    if (!this.config().sortable) return;

    if (!sort.direction || !sort.active) {
      this.currentSort = null;
      this.sortChange.emit({ column: '', direction: 'desc' });
      return;
    }

    this.currentSort = { column: sort.active, direction: sort.direction };
    this.sortChange.emit(this.currentSort);
  }

  protected getCustomTemplate(templateName?: string): TemplateRef<any> | null {
    if (!templateName) return null;
    return this.customTemplates()[templateName] || null;
  }

  protected toggleSelection(row: any): void {
    const idx = this.selection.findIndex(item => this.getRowId(item) === this.getRowId(row));
    if (idx > -1) {
      this.selection.splice(idx, 1);
    } else {
      this.selection.push(row);
    }
    this.selectionChange.emit([...this.selection]);
  }

  protected executeAction(actionKey: string, row: any): void {
    this.actionClick.emit({ action: actionKey, row });
  }

  protected isActionVisible(action: TableAction, row: any): boolean {
    return action.visible ? action.visible(row) : true;
  }

  protected isActionDisabled(action: TableAction, row: any): boolean {
    return action.disabled ? action.disabled(row) : false;
  }

  protected getActionButtonClass(action: TableAction): string {
    const baseClass = 'action-button';
    const colorClass = this.getActionColorClass(action.color);
    return `${baseClass} ${colorClass}`;
  }

  protected getRowClass(row?: any): string {
    let baseClass = 'table-row';

    if (this.config().rowClassFunction && row) {
      const customClass = this.config().rowClassFunction!(row);
      if (customClass) {
        baseClass += ` ${customClass}`;
      }
    }

    return baseClass;
  }

  private updateOverflowState(): void {
    const nodes = this.elementRef.nativeElement.querySelectorAll(
      '.text-content.truncated[data-truncate-key]',
    ) as NodeListOf<HTMLElement>;
    if (!nodes.length) {
      if (this.overflowMap().size > 0) this.overflowMap.set(new Map());
      return;
    }
    const next = new Map<string, boolean>();
    let changed = false;
    const prev = this.overflowMap();
    nodes.forEach(el => {
      const key = el.dataset['truncateKey'];
      if (!key) return;
      // When element is in expanded state, we can't measure clamp overflow — keep previous value.
      if (el.classList.contains('expanded')) {
        const prevVal = prev.get(key) ?? true;
        next.set(key, prevVal);
        return;
      }
      const overflows = el.scrollHeight - el.clientHeight > 1 || el.scrollWidth - el.clientWidth > 1;
      next.set(key, overflows);
      if (prev.get(key) !== overflows) changed = true;
    });
    if (changed || next.size !== prev.size) {
      this.overflowMap.set(next);
    }
  }

  private updateHorizontalScrollState(): void {
    const el = this.elementRef.nativeElement.querySelector('.table-container') as HTMLElement | null;
    if (el) {
      this.applyHorizontalScrollState(el);
    }
  }

  private applyHorizontalScrollState(el: HTMLElement): void {
    const canScroll = el.scrollWidth - el.clientWidth > 1;
    const scrolled = el.scrollLeft > 0;
    const atEnd = !canScroll || el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

    if (this.isScrolledX() !== scrolled) {
      this.isScrolledX.set(scrolled);
    }
    if (this.isAtEndX() !== atEnd) {
      this.isAtEndX.set(atEnd);
    }
  }

  private preserveScrollPosition(): void {
    const tableContainer = this.elementRef.nativeElement.querySelector('.table-container');
    if (tableContainer) {
      // Keep the scroll position slightly adjusted to account for new content
      const currentScrollTop = tableContainer.scrollTop;
      if (currentScrollTop > 0) {
        tableContainer.scrollTop = currentScrollTop;
      }
    }
  }

  private updateInfiniteScrollObserver(): void {
    if (!this.config().infiniteScroll || !this.intersectionObserver) {
      return;
    }

    // Disconnect from previous observation
    this.intersectionObserver.disconnect();

    // Re-observe the new last row
    setTimeout(() => {
      const lastRow = this.elementRef.nativeElement.querySelector('.mat-mdc-row:last-child');
      if (lastRow) {
        this.intersectionObserver?.observe(lastRow);
      }
    }, 100);
  }

  private initializeInfiniteScroll(): void {
    if (!this.config().infiniteScroll || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const tableContainer = this.elementRef.nativeElement.querySelector('.table-container');
    if (!tableContainer) return;

    this.intersectionObserver = new IntersectionObserver(
      entries => {
        const target = entries[0];
        if (target.isIntersecting && !this.config().loadingMore) {
          this.loadMore.emit();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        root: tableContainer, // Use table container as root instead of viewport
      },
    );

    // Observe the last row when it exists
    setTimeout(() => {
      const lastRow = this.elementRef.nativeElement.querySelector('.mat-mdc-row:last-child');
      if (lastRow) {
        this.intersectionObserver?.observe(lastRow);
      }
    }, 100);
  }

  private getActionColorClass(color?: string): string {
    switch (color) {
      case 'primary':
        return 'action-primary';
      case 'secondary':
        return 'action-secondary';
      case 'danger':
        return 'action-danger';
      case 'success':
        return 'action-success';
      case 'warning':
        return 'action-warning';
      default:
        return 'action-secondary';
    }
  }
}
