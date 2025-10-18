import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  AfterViewInit,
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
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowDown,
  heroArrowUp,
  heroArrowsUpDown,
  heroCalendar,
  heroEye,
  heroPencil,
  heroTrash,
  heroXMark,
} from '@ng-icons/heroicons/outline';
import { TranslateModule } from '@ngx-translate/core';
import { CustomDatePipe } from '../../pipes/custom-date.pipe';
import { PlatformService } from '../../services/platform.service';
import { ThemeService } from '../../services/theme.service';
import { ImageComponent } from './image.component';

export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'boolean' | 'date' | 'image' | 'custom';
  sortable?: boolean;
  width?: string | number;
  customTemplate?: string;
  truncate?: boolean;
  truncateLength?: number;
  maxLines?: number;
  autoTruncate?: boolean;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  hideOn?: 'mobile' | 'tablet' | never;
  priority?: number; // 1 = highest priority, shown first on mobile
}

export interface TableAction {
  key: string;
  label: string;
  icon?: string;
  color?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  visible?: (row: any) => boolean;
  disabled?: (row: any) => boolean;
}

export interface TableRow {
  [key: string]: any;
}

export interface TableConfig {
  columns: TableColumn[];
  actions?: TableAction[];
  selectable?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  striped?: boolean;
  hover?: boolean;
  scrollable?: boolean;
  responsiveBreakpoint?: number;
  infiniteScroll?: boolean;
  loadingMore?: boolean;
  rowClassFunction?: (row: any) => string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    ImageComponent,
    NgIconComponent,
    TranslateModule,
    CustomDatePipe,
  ],
  providers: [
    provideIcons({
      heroCalendar,
      heroXMark,
      heroPencil,
      heroEye,
      heroTrash,
      heroArrowUp,
      heroArrowDown,
      heroArrowsUpDown,
    }),
  ],
  template: `
    @if (loading() && !data().length) {
    <div class="state-overlay">
      <div class="loading-spinner"></div>
      <span>{{ 'Basic.loading' | translate }}</span>
    </div>
  } @else if (!data().length) {
    <div class="state-overlay no-data-state">
      <p>
        {{ noResultsMessage() | translate }}
      </p>
    </div>
  } @else {
    <div
      class="table-container dark:border-dark-border-primary border-border-primary border"
      [class.mobile-view]="isMobile()"
      [class.dark]="isDarkMode()"
      [ngStyle]="getTableContainerStyle()"
    >
      <table
        mat-table
        [dataSource]="data()"
        class="mat-elevation-z1 responsive-table"
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
        } @for (column of config().columns; track column.key) {
        <ng-container [matColumnDef]="column.key">
          <th
            mat-header-cell
            *matHeaderCellDef
            [class]="getHeaderClass(column)"
            [style.width]="getColumnWidth(column)"
          >
            {{ column.label | translate }}
            @if (column.sortable && config().sortable) {
            <button
              (click)="sort(column.key)"
              class="sort-button"
              [attr.aria-label]="'Sort by ' + (column.label | translate)"
            >
              @if (currentSort?.column === column.key) { @if
              (currentSort?.direction === 'asc') {
              <ng-icon name="heroArrowUp" size="12"></ng-icon>
              } @else {
              <ng-icon name="heroArrowDown" size="12"></ng-icon>
              } } @else {
              <ng-icon name="heroArrowsUpDown" size="12"></ng-icon>
              }
            </button>
            }
          </th>
          <td
            mat-cell
            *matCellDef="let row"
            [class]="getCellClass(column)"
            [attr.data-column]="column.key"
          >
            @switch (column.type) { @case ('text') { @if (column.truncate ||
            column.autoTruncate) {
            <div
              class="text-cell"
              [class.expandable]="
                shouldShowExpandButton(row, column.key, column)
              "
            >
              <div
                class="text-content"
                [class.expanded]="isTextExpanded(row, column.key)"
                [class.truncated]="
                  !isTextExpanded(row, column.key) &&
                  shouldShowExpandButton(row, column.key, column)
                "
                [style.--max-lines]="getMaxLines(column)"
                [title]="getValue(row, column.key)"
              >
                {{ getValue(row, column.key) || '-' }}
              </div>
              @if (shouldShowExpandButton(row, column.key, column)) {
              <span
                (click)="toggleTextExpansion(row, column.key, $event)"
                class="expand-link"
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
            <span class="simple-text">{{
              getValue(row, column.key) || '-'
            }}</span>
            } } @case ('boolean') {
            <span class="boolean-cell">{{
              getValue(row, column.key)
                ? ('Basic.yes' | translate)
                : ('Basic.no' | translate)
            }}</span>
            } @case ('date') {
            <span class="date-cell">{{
              (getValue(row, column.key) | customDate) || '-'
            }}</span>
            } @case ('image') {
            <div class="image-cell">
              <app-image
                [initialUrl]="getValue(row, column.key)"
                format="square"
                size="sm"
                mode="preview"
                (click)="$event.stopPropagation(); projectImageClick.emit(row)"
              />
            </div>
            } @case ('custom') {
            <div class="custom-cell">
              <ng-container
                *ngTemplateOutlet="
                  getCustomTemplate(column.customTemplate);
                  context: { $implicit: row, column: column }
                "
              ></ng-container>
            </div>
            } }
          </td>
        </ng-container>
        } @if (config().actions?.length) {
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef class="actions-header">
            {{ 'Basic.actions' | translate }}
          </th>
          <td mat-cell *matCellDef="let row" class="actions-cell">
            <div class="actions-container">
              @for (action of config().actions; track action.key) { @if
              (isActionVisible(action, row)) {
              <button
                [disabled]="isActionDisabled(action, row)"
                (click)="
                  $event.stopPropagation(); executeAction(action.key, row)
                "
                [class]="getActionButtonClass(action)"
                [attr.aria-label]="action.label | translate"
              >
                @if (action.icon) {
                <ng-icon [name]="action.icon" size="1.125rem" />
                } @else {
                <span>{{ action.label | translate }}</span>
                }
              </button>
              } }
            </div>
          </td>
        </ng-container>
        }

        <tr
          mat-header-row
          *matHeaderRowDef="displayedColumns; sticky: true"
        ></tr>
        <tr
          mat-row
          *matRowDef="let row; columns: displayedColumns"
          [class]="getRowClass(row)"
          (click)="onRowClick(row)"
        ></tr>
      </table>

      @if (config().infiniteScroll && config().loadingMore && data().length > 0) {
      <div class="loading-more-overlay">
        <div class="loading-more-content">
          <div class="loading-more-spinner"></div>
          <span class="loading-more-text">{{
            'Basic.loadingMore' | translate
          }}</span>
        </div>
      </div>
      }
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
        color: #6b7280;
      }

      .dark .state-overlay {
        background-color: #374151;
        border-color: #374151;
        color: #d1d5db;
      }

      .no-data-state {
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .loading-spinner {
        width: 2rem;
        height: 2rem;
        border: 3px solid #f9fafb;
        border-top: 3px solid #f97316;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .dark .loading-spinner {
        border-color: #374151;
        border-top-color: #fdba74;
      }

      .table-container {
        width: 100%;
        overflow-y: auto;
        overflow-x: auto;
        border-radius: 0.5rem;
        position: relative;
      }

      .responsive-table {
        width: 100%;
        min-width: 600px;
        table-layout: fixed;
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
        color: #374151;
        border-bottom: 1px solid #e5e7eb;
        padding: 0.75rem 1rem;
        z-index: 1;
        background-color: #f9fafb;
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

      .mat-mdc-header-row {
        z-index: 1;
      }

      .mat-mdc-cell {
        border-bottom: 1px solid #f9fafb;
        padding: 0.75rem 1rem;
        vertical-align: top;
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

      ::ng-deep
        .mat-mdc-checkbox
        .mdc-checkbox__native-control:enabled:not(:checked):not(
          :indeterminate
        ):not([data-indeterminate='true'])
        ~ .mdc-checkbox__background {
        border-color: #f97316; /* primary-500 */
      }

      ::ng-deep
        .mat-mdc-checkbox
        .mdc-checkbox__native-control:enabled:checked
        ~ .mdc-checkbox__background,
      ::ng-deep
        .mat-mdc-checkbox
        .mdc-checkbox__native-control:enabled:indeterminate
        ~ .mdc-checkbox__background,
      ::ng-deep
        .mat-mdc-checkbox
        .mdc-checkbox__native-control[data-indeterminate='true']:enabled
        ~ .mdc-checkbox__background {
        background-color: #f97316; /* primary-500 */
        border-color: #f97316; /* primary-500 */
      }

      ::ng-deep
        .mat-mdc-checkbox:hover
        .mdc-checkbox__native-control:enabled:not(:checked):not(
          :indeterminate
        ):not([data-indeterminate='true'])
        ~ .mdc-checkbox__background {
        border-color: #ea580c; /* primary-600 */
      }

      ::ng-deep
        .mat-mdc-checkbox:hover
        .mdc-checkbox__native-control:enabled:checked
        ~ .mdc-checkbox__background,
      ::ng-deep
        .mat-mdc-checkbox:hover
        .mdc-checkbox__native-control:enabled:indeterminate
        ~ .mdc-checkbox__background,
      ::ng-deep
        .mat-mdc-checkbox:hover
        .mdc-checkbox__native-control[data-indeterminate='true']:enabled
        ~ .mdc-checkbox__background {
        background-color: #ea580c; /* primary-600 */
        border-color: #ea580c; /* primary-600 */
      }

      ::ng-deep .mat-mdc-checkbox .mdc-checkbox__ripple {
        color: #f97316;
      }

      .text-cell {
        position: relative;
        max-width: 100%;
      }

      .text-content {
        word-wrap: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
        line-height: 1.5;
      }

      .text-content.truncated {
        display: -webkit-box;
        -webkit-line-clamp: var(--max-lines, 2);
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
        color: #f97316;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        border-radius: 0.25rem;
        text-decoration: none;
        user-select: none;
      }

      .expand-link:hover {
        color: #ea580c;
        background-color: #fff7ed;
      }

      .expand-link:active {
        color: #c2410c;
        background-color: #ffedd5;
      }

      .expand-link:focus {
        outline: 2px solid #f97316;
        outline-offset: 2px;
      }

      .boolean-cell {
        font-weight: 500;
      }

      .date-cell {
        font-variant-numeric: tabular-nums;
      }

      .image-cell {
        padding: 0.5rem;
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
        min-width: 2rem;
        min-height: 2rem;
      }

      .action-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .action-primary {
        color: #f97316;
        background-color: #fff7ed;
      }

      .action-primary:hover:not(:disabled) {
        background-color: #ffedd5;
        color: #ea580c;
      }

      .action-secondary {
        color: #6b7280;
        background-color: #f9fafb;
      }

      .action-secondary:hover:not(:disabled) {
        background-color: #f9fafb;
        color: #374151;
      }

      .action-danger {
        color: #ef4444;
        background-color: #fef2f2;
      }

      .action-danger:hover:not(:disabled) {
        background-color: #fee2e2;
        color: #dc2626;
      }

      .action-success {
        color: #10b981;
        background-color: #ecfdf5;
      }

      .action-success:hover:not(:disabled) {
        background-color: #d1fae5;
        color: #059669;
      }

      .action-warning {
        color: #f59e0b;
        background-color: #fffbeb;
      }

      .action-warning:hover:not(:disabled) {
        background-color: #fef3c7;
        color: #d97706;
      }

      .sort-button {
        margin-left: 0.5rem;
        padding: 0.125rem 0.25rem;
        color: #6b7280;
        font-size: 0.75rem;
        background: none;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        transition: color 0.2s ease;
      }

      .sort-button:hover {
        color: #f97316;
      }

      .sort-button:focus {
        outline: 2px solid #f97316;
        outline-offset: 2px;
      }

      .mat-mdc-row {
        cursor: pointer;
        transition: background-color 0.15s ease;
      }

      .mat-mdc-row:hover {
        background-color: #fff7ed;
      }

      .mat-mdc-row:nth-child(even) {
        background-color: #f9fafb;
      }

      .mat-mdc-row:nth-child(even):hover {
        background-color: #ffedd5;
      }

      @media (max-width: 768px) {
        .responsive-table {
          min-width: 500px;
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
          min-width: 400px;
        }

        .text-content {
          font-size: 0.75rem;
          line-height: 1.1;
        }

        .mat-mdc-cell,
        .mat-mdc-header-cell {
          padding: 0.5rem;
        }

        .expand-toggle {
          font-size: 0.625rem;
          padding: 0.125rem;
        }

        .expand-link {
          font-size: 0.625rem;
          padding: 0.125rem;
        }
      }

      :host .dark .mat-mdc-header-cell {
        color: #d1d5db;
        border-bottom-color: #374151;
        background-color: #374151;
        z-index: 1;
      }

      .dark .mat-mdc-cell {
        color: #e5e7eb;
        border-bottom-color: #374151;
      }

      .dark .mat-mdc-row {
        background-color: #1f2937;
      }

      .dark .mat-mdc-row:hover {
        background-color: #7c2d12;
      }

      .dark .mat-mdc-row:nth-child(even) {
        background-color: #374151;
      }

      .dark .mat-mdc-row:nth-child(even):hover {
        background-color: #9a3412;
      }

      .dark .expand-link {
        color: #fdba74;
      }

      .dark .expand-link:hover {
        color: #fed7aa;
        background-color: #9a3412;
      }

      .dark .expand-link:active {
        color: #ffedd5;
        background-color: #7c2d12;
      }

      .dark
        ::ng-deep
        .mat-mdc-checkbox
        .mdc-checkbox__native-control:enabled:not(:checked):not(
          :indeterminate
        ):not([data-indeterminate='true'])
        ~ .mdc-checkbox__background {
        border-color: #ea580c; /* primary-600 */
      }

      .dark
        ::ng-deep
        .mat-mdc-checkbox
        .mdc-checkbox__native-control:enabled:checked
        ~ .mdc-checkbox__background,
      .dark
        ::ng-deep
        .mat-mdc-checkbox
        .mdc-checkbox__native-control:enabled:indeterminate
        ~ .mdc-checkbox__background,
      .dark
        ::ng-deep
        .mat-mdc-checkbox
        .mdc-checkbox__native-control[data-indeterminate='true']:enabled
        ~ .mdc-checkbox__background {
        background-color: #ea580c; /* primary-600 */
        border-color: #ea580c; /* primary-600 */
      }

      .dark
        ::ng-deep
        .mat-mdc-checkbox:hover
        .mdc-checkbox__native-control:enabled:not(:checked):not(
          :indeterminate
        ):not([data-indeterminate='true'])
        ~ .mdc-checkbox__background {
        border-color: #c2410c; /* primary-700 */
      }

      .dark
        ::ng-deep
        .mat-mdc-checkbox:hover
        .mdc-checkbox__native-control:enabled:checked
        ~ .mdc-checkbox__background,
      .dark
        ::ng-deep
        .mat-mdc-checkbox:hover
        .mdc-checkbox__native-control:enabled:indeterminate
        ~ .mdc-checkbox__background,
      .dark
        ::ng-deep
        .mat-mdc-checkbox:hover
        .mdc-checkbox__native-control[data-indeterminate='true']:enabled
        ~ .mdc-checkbox__background {
        background-color: #c2410c; /* primary-700 */
        border-color: #c2410c; /* primary-700 */
      }

      .dark .action-primary {
        color: #fdba74;
        background-color: #9a3412;
      }

      .dark .action-primary:hover:not(:disabled) {
        background-color: #7c2d12;
        color: #fed7aa;
      }

      .dark .action-secondary {
        color: #d1d5db;
        background-color: #374151;
      }

      .dark .action-secondary:hover:not(:disabled) {
        background-color: #374151;
        color: #e5e7eb;
      }

      .dark .action-danger {
        color: #fca5a5;
        background-color: #991b1b;
      }

      .dark .action-danger:hover:not(:disabled) {
        background-color: #7f1d1d;
        color: #fecaca;
      }

      .dark .action-success {
        color: #6ee7b7;
        background-color: #065f46;
      }

      .dark .action-success:hover:not(:disabled) {
        background-color: #064e3b;
        color: #a7f3d0;
      }

      .dark .action-warning {
        color: #fcd34d;
        background-color: #92400e;
      }

      .dark .action-warning:hover:not(:disabled) {
        background-color: #78350f;
        color: #fde68a;
      }

      .dark .sort-button {
        color: #9ca3af;
      }

      .dark .sort-button:hover {
        color: #fdba74;
      }

      .loading-more-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.9);
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

      .loading-more-spinner {
        width: 1rem;
        height: 1rem;
        border: 2px solid #f9fafb;
        border-top: 2px solid #f97316;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-more-text {
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 500;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .dark .loading-more-overlay {
        background: rgba(31, 41, 55, 0.9);
      }

      .dark .loading-more-spinner {
        border-color: #374151;
        border-top-color: #fdba74;
      }

      .dark .loading-more-text {
        color: #d1d5db;
      }

      .priority-high {
        background-color: #fef2f2 !important;
      }

      .priority-high:hover {
        background-color: #fee2e2 !important;
      }

      .priority-low {
        background-color: #eff6ff !important;
      }

      .priority-low:hover {
        background-color: #dbeafe !important;
      }

      .dark .priority-high {
        background-color: #7f1d1d !important;
      }

      .dark .priority-high:hover {
        background-color: #991b1b !important;
      }

      .dark .priority-low {
        background-color: #1e3a8a !important;
      }

      .dark .priority-low:hover {
        background-color: #1e40af !important;
      }
    `,
  ],
})
export class TableComponent implements AfterViewChecked, OnDestroy {
  data = input.required<TableRow[]>();
  config = input.required<TableConfig>();
  loading = input(false);
  customTemplates = input<{ [key: string]: TemplateRef<any>; }>({});
  initialSort = input<{ column: string; direction: 'asc' | 'desc'; } | null>(
    null,
  );
  height = input<string | null>(null);
  noResultsMessage = input<string>('Basic.noResults');

  selectionChange = output<any[]>();
  actionClick = output<{ action: string; row: any; }>();
  sortChange = output<{ column: string; direction: 'asc' | 'desc'; }>();
  rowClick = output<any>();
  projectImageClick = output<any>();
  loadMore = output<void>();

  @ContentChild('customTemplate')
  customTemplate!: TemplateRef<any>;

  private readonly themeService = inject(ThemeService);
  private readonly platformService = inject(PlatformService);
  protected readonly isDarkMode = computed(
    () => this.themeService.currentTheme === 'dark',
  );
  protected readonly isMobile = computed(() => this.platformService.isMobile());

  private selection: any[] = [];
  private expandedTexts: Map<string, boolean> = new Map();
  protected currentSort: { column: string; direction: 'asc' | 'desc'; } | null = null;
  private intersectionObserver?: IntersectionObserver;
  private previousDataLength = 0;
  private shouldPreserveScroll = false;

  constructor(private elementRef: ElementRef) {
    effect(() => {
      const currentData = this.data();
      const config = this.config();
      const currentDataLength = currentData.length;

      if (
        currentDataLength > this.previousDataLength
        && config.loadingMore
      ) {
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

  ngAfterViewChecked() {
    // Preserve scroll position after view is updated when loading more
    if (this.shouldPreserveScroll) {
      this.shouldPreserveScroll = false;
      // Small delay to ensure the new rows are rendered
      setTimeout(() => {
        this.preserveScrollPosition();
      }, 0);
    }
  }

  ngOnDestroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  protected getTableContainerStyle(): { [key: string]: string; } {
    if (this.height()) {
      return { height: this.height()! };
    }

    if (this.config().infiniteScroll && this.data().length > 0) {
      return { 'max-height': '600px' };
    }

    return {};
  }

  private preserveScrollPosition() {
    const tableContainer = this.elementRef.nativeElement.querySelector('.table-container');
    if (tableContainer) {
      // Keep the scroll position slightly adjusted to account for new content
      const currentScrollTop = tableContainer.scrollTop;
      if (currentScrollTop > 0) {
        tableContainer.scrollTop = currentScrollTop;
      }
    }
  }

  private updateInfiniteScrollObserver() {
    if (!this.config().infiniteScroll || !this.intersectionObserver) {
      return;
    }

    // Disconnect from previous observation
    this.intersectionObserver.disconnect();

    // Re-observe the new last row
    setTimeout(() => {
      const lastRow = this.elementRef.nativeElement.querySelector(
        '.mat-mdc-row:last-child',
      );
      if (lastRow) {
        this.intersectionObserver?.observe(lastRow);
      }
    }, 100);
  }

  private initializeInfiniteScroll() {
    if (
      !this.config().infiniteScroll
      || typeof IntersectionObserver === 'undefined'
    ) {
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
      const lastRow = this.elementRef.nativeElement.querySelector(
        '.mat-mdc-row:last-child',
      );
      if (lastRow) {
        this.intersectionObserver?.observe(lastRow);
      }
    }, 100);
  }

  get displayedColumns(): string[] {
    const columns = [];
    if (this.config().selectable) {
      columns.push('select');
    }

    const visibleColumns = this.config().columns.filter(col => {
      if (col.hideOn === 'mobile' && this.isMobile()) {
        return false;
      }
      if (col.hideOn === 'tablet' && this.isMobile()) {
        return false;
      }
      return true;
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

  protected toggleTextExpansion(
    row: any,
    columnKey: string,
    event?: Event,
  ): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    const key = `${this.getRowId(row)}-${columnKey}`;
    const isExpanded = this.expandedTexts.get(key) || false;
    this.expandedTexts.set(key, !isExpanded);
  }

  protected shouldShowExpandButton(
    row: any,
    columnKey: string,
    column: TableColumn,
  ): boolean {
    const text = this.getValue(row, columnKey);
    if (!text) return false;

    const maxLines = this.getMaxLines(column);
    const approximateCharsPerLine = this.isMobile() ? 20 : 60;
    const approximateMaxChars = maxLines * approximateCharsPerLine;

    return text.length > approximateMaxChars;
  }

  protected isTextExpanded(row: any, columnKey: string): boolean {
    const key = `${this.getRowId(row)}-${columnKey}`;
    return this.expandedTexts.get(key) || false;
  }

  protected toggleSelectAll(event: any) {
    if (event.checked) {
      this.selection = [...this.data()];
    } else {
      this.selection = [];
    }
    this.selectionChange.emit([...this.selection]);
  }

  protected isAllSelected(): boolean {
    return (
      this.data().length > 0 && this.selection.length === this.data().length
    );
  }

  protected isIndeterminate(): boolean {
    return (
      this.selection.length > 0 && this.selection.length < this.data().length
    );
  }

  protected sort(column: string) {
    if (!this.config().sortable) return;

    let direction: 'asc' | 'desc' | null;

    if (this.currentSort?.column === column) {
      // Cycling through: asc -> desc -> null (default)
      if (this.currentSort.direction === 'asc') {
        direction = 'desc';
      } else if (this.currentSort.direction === 'desc') {
        direction = null; // Reset to default
      } else {
        direction = 'asc';
      }
    } else {
      // First click on new column starts with asc
      direction = 'asc';
    }

    if (direction === null) {
      // Reset to default sort
      this.currentSort = null;
      this.sortChange.emit({ column: '', direction: 'desc' }); // Default sort
    } else {
      this.currentSort = { column, direction };
      this.sortChange.emit({ column, direction });
    }
  }

  protected getCustomTemplate(templateName?: string): TemplateRef<any> | null {
    if (!templateName) return null;
    return this.customTemplates()[templateName] || null;
  }

  protected toggleSelection(row: any) {
    const idx = this.selection.findIndex(
      item => this.getRowId(item) === this.getRowId(row),
    );
    if (idx > -1) {
      this.selection.splice(idx, 1);
    } else {
      this.selection.push(row);
    }
    this.selectionChange.emit([...this.selection]);
  }

  protected executeAction(actionKey: string, row: any) {
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

  private getRowId(row: any): any {
    return row.id || row._id || JSON.stringify(row);
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

  public isSelected(row: any): boolean {
    return this.selection.some(
      item => this.getRowId(item) === this.getRowId(row),
    );
  }

  public getValue(row: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], row);
  }

  public onRowClick(row: any) {
    this.rowClick.emit(row);
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
    if (column.maxLines) {
      return column.maxLines;
    }

    return this.isMobile() ? 1 : 3;
  }

  protected trackByFunction = (index: number, item: any): any => {
    return item.id || item.uuid || index;
  };
}
