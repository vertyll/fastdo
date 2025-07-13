import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  OnDestroy,
  TemplateRef,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCalendar, heroEye, heroPencil, heroTrash, heroXMark } from '@ng-icons/heroicons/outline';
import { TranslateModule } from '@ngx-translate/core';
import { TruncateTextPipe } from '../../pipes/truncate-text.pipe';
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
    TruncateTextPipe,
  ],
  providers: [provideIcons({ heroCalendar, heroXMark, heroPencil, heroEye, heroTrash })],
  template: `
    <div [class]="getTableContainerClass()">
      <table mat-table [dataSource]="data()" class="mat-elevation-z1 w-full min-w-max" #tableElement>
        <!-- Checkbox Column -->
        @if (config().selectable) {
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef [style.width]="'60px'" class="text-center">
              <mat-checkbox
                (change)="toggleSelectAll($event)"
                [checked]="isAllSelected()"
                [indeterminate]="isIndeterminate()"
                color="primary"
                class="text-primary-500 accent-primary-500"
              ></mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row" class="text-center align-middle">
              <mat-checkbox
                (change)="toggleSelection(row)"
                (click)="$event.stopPropagation()"
                [checked]="isSelected(row)"
                color="primary"
                class="text-primary-500 accent-primary-500"
              ></mat-checkbox>
            </td>
          </ng-container>
        }

        <!-- Dynamic Columns -->
        @for (column of config().columns; track column.key) {
          <ng-container [matColumnDef]="column.key">
            <th mat-header-cell *matHeaderCellDef 
                [style.width]="getColumnWidth(column)"
                [class]="getHeaderAlignmentClass(column)">
              {{ column.label | translate }}
              @if (column.sortable && config().sortable) {
                <button 
                  (click)="sort(column.key)"
                  class="ml-2 text-xs hover:text-blue-500 transition-colors"
                >
                  @if (currentSort?.column === column.key) {
                    @if (currentSort?.direction === 'asc') {
                      ↑
                    } @else {
                      ↓
                    }
                  } @else {
                    ↕
                  }
                </button>
              }
            </th>
            <td mat-cell *matCellDef="let row" 
                [attr.data-column]="column.key"
                [class]="getCellAlignmentClass(column)">
              @switch (column.type) {
                @case ('text') {
                  @if (column.truncate || column.autoTruncate) {
                    <div 
                      class="text-cell-container"
                      [class.line-clamp]="!isTextExpanded(row, column.key) && (column.maxLines || getResponsiveMaxLines())"
                      [style.--max-lines]="column.maxLines || getResponsiveMaxLines()"
                      #textCell
                    >
                      <span 
                        [title]="getValue(row, column.key)"
                        class="break-words select-text"
                      >
                        @if (isTextExpanded(row, column.key)) {
                          {{ getValue(row, column.key) }}
                          <button 
                            (click)="toggleTextExpansion(row, column.key, $event)"
                            class="ml-1 text-blue-500 hover:text-blue-700 font-medium text-sm cursor-pointer inline-flex items-center"
                            [title]="'Basic.showLess' | translate"
                          >
                            [{{ 'Basic.showLess' | translate }}]
                          </button>
                        } @else {
                          @if (shouldShowExpandButton(row, column.key, column)) {
                            {{ getValue(row, column.key) | truncateText:(getEffectiveTruncateLength(column)):false }}
                            <button 
                              (click)="toggleTextExpansion(row, column.key, $event)"
                              class="ml-1 text-blue-500 hover:text-blue-700 font-medium text-sm cursor-pointer inline-flex items-center"
                              [title]="'Basic.showMore' | translate"
                            >
                              [{{ 'Basic.showMore' | translate }}]
                            </button>
                          } @else {
                            {{ getValue(row, column.key) }}
                          }
                        }
                      </span>
                    </div>
                  } @else {
                    <span class="break-words">{{ getValue(row, column.key) || '-' }}</span>
                  }
                }
                @case ('boolean') {
                  <span>{{ getValue(row, column.key) ? ('Basic.yes' | translate) : ('Basic.no' | translate) }}</span>
                }
                @case ('date') {
                  <span>{{ getValue(row, column.key) | date:'short' }}</span>
                }
                @case ('image') {
                  <div class="py-2 flex-shrink-0">
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
                  <ng-container 
                    *ngTemplateOutlet="getCustomTemplate(column.customTemplate); context: { $implicit: row, column: column }"
                  ></ng-container>
                }
              }
            </td>
          </ng-container>
        }

        <!-- Actions Column -->
        @if (config().actions && config()) {
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef 
                [style.width]="getActionsWidth()"
                class="text-center">
              {{ 'Basic.actions' | translate }}
            </th>
            <td mat-cell *matCellDef="let row" class="text-center align-middle">
              <div class="flex gap-1 flex-shrink-0 justify-center">
                @for (action of config().actions; track action.key) {
                  @if (isActionVisible(action, row)) {
                    <button 
                      [disabled]="isActionDisabled(action, row)"
                      (click)="$event.stopPropagation(); executeAction(action.key, row)"
                      [class]="getActionButtonClass(action)"
                      [title]="action.label | translate"
                    >
                      @if (action.icon) {
                        <ng-icon 
                          [name]="action.icon" 
                          size="18"
                          class="transition-transform duration-200 ease-in-out group-hover:scale-125"
                        />
                      } @else {
                        <span class="text-xs">{{ action.label | translate }}</span>
                      }
                    </button>
                  }
                }
              </div>
            </td>
          </ng-container>
        }

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr 
          mat-row 
          *matRowDef="let row; columns: displayedColumns;" 
          [class]="getRowClass()"
          (click)="onRowClick(row)"
        ></tr>
      </table>
    </div>
  `,
  styles: [`
    .text-cell-container {
      min-height: 1.5rem;
      overflow: hidden;
      word-wrap: break-word;
      hyphens: auto;
    }

    .line-clamp {
      display: -webkit-box;
      -webkit-line-clamp: var(--max-lines, 2);
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .break-words {
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
    }

    .text-left {
      text-align: left;
    }

    .text-center {
      text-align: center;
    }

    .text-right {
      text-align: right;
    }

    .align-top {
      vertical-align: top;
    }

    .align-middle {
      vertical-align: middle;
    }

    .align-bottom {
      vertical-align: bottom;
    }

    @media (max-width: 768px) {
      .text-cell-container {
        font-size: 0.875rem;
        line-height: 1.25rem;
      }
    }

    @media (max-width: 640px) {
      .text-cell-container {
        font-size: 0.75rem;
        line-height: 1rem;
      }
    }

    table {
      table-layout: fixed;
    }

    td, th {
      overflow: hidden;
      padding: 0.5rem;
    }

    .expand-button {
      display: inline-flex;
      align-items: center;
      margin-left: 0.25rem;
      color: #3b82f6;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: color 0.2s;
      user-select: none;
      white-space: nowrap;
    }

    .expand-button:hover {
      color: #1d4ed8;
    }

    .expand-button:focus {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
      border-radius: 0.25rem;
    }

    .select-text {
      user-select: text;
    }

    @media (max-width: 1024px) {
      td[data-column="dateCreation"],
      th[data-column="dateCreation"] {
        display: none !important;
      }
    }

    @media (max-width: 768px) {
      td[data-column="isPublic"],
      th[data-column="isPublic"] {
        display: none !important;
      }
    }
  `],
})
export class TableComponent implements AfterViewInit, OnDestroy {
  data = input.required<TableRow[]>();
  config = input.required<TableConfig>();
  loading = input(false);
  customTemplates = input<{ [key: string]: TemplateRef<any>; }>({});
  selectionChange = output<any[]>();
  actionClick = output<{ action: string; row: any; }>();
  sortChange = output<{ column: string; direction: 'asc' | 'desc'; }>();
  rowClick = output<any>();
  projectImageClick = output<any>();

  @ContentChild('customTemplate')
  customTemplate!: TemplateRef<any>;

  private selection: any[] = [];
  private expandedTexts: Map<string, boolean> = new Map();
  protected currentSort: { column: string; direction: 'asc' | 'desc'; } | null = null;
  private resizeObserver?: ResizeObserver;
  private currentScreenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop';

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.initializeResponsiveObserver();
    this.updateScreenSize();
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private initializeResponsiveObserver() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateScreenSize();
      });
      this.resizeObserver.observe(this.elementRef.nativeElement);
    }
  }

  private updateScreenSize() {
    const width = window.innerWidth;
    const breakpoint = this.config().responsiveBreakpoint || 768;

    if (width < 640) {
      this.currentScreenSize = 'mobile';
    } else if (width < breakpoint) {
      this.currentScreenSize = 'tablet';
    } else {
      this.currentScreenSize = 'desktop';
    }
  }

  protected getResponsiveMaxLines(): number {
    switch (this.currentScreenSize) {
      case 'mobile':
        return 1;
      case 'tablet':
        return 2;
      case 'desktop':
      default:
        return 3;
    }
  }

  protected getEffectiveTruncateLength(column: TableColumn): number {
    if (column.autoTruncate) {
      switch (this.currentScreenSize) {
        case 'mobile':
          return 30;
        case 'tablet':
          return 60;
        case 'desktop':
        default:
          return column.truncateLength || 100;
      }
    }
    return column.truncateLength || 50;
  }

  protected getHeaderAlignmentClass(column: TableColumn): string {
    const align = column.align || 'left';
    return `text-${align}`;
  }

  protected getCellAlignmentClass(column: TableColumn): string {
    const horizontalAlign = column.align || 'left';
    const verticalAlign = column.verticalAlign || 'top';
    return `text-${horizontalAlign} align-${verticalAlign}`;
  }

  get displayedColumns(): string[] {
    const columns = [];
    if (this.config().selectable) {
      columns.push('select');
    }

    const visibleColumns = this.config().columns.filter(col => {
      if (this.currentScreenSize === 'mobile') {
        return ['name', 'image'].includes(col.key);
      } else if (this.currentScreenSize === 'tablet') {
        return !['dateCreation', 'isPublic'].includes(col.key);
      }
      return true;
    });

    columns.push(...visibleColumns.map((col: TableColumn) => col.key));

    const cfg = this.config();
    if (cfg && cfg.actions && cfg.actions.length > 0) {
      columns.push('actions');
    }
    return columns;
  }

  protected getTableContainerClass(): string {
    const baseClass = 'w-full';
    const scrollableClass = this.config().scrollable !== false ? 'overflow-x-auto' : '';
    const responsiveClass = 'overflow-hidden';
    return `${baseClass} ${scrollableClass} ${responsiveClass}`.trim();
  }

  protected getColumnWidth(column: TableColumn): string {
    if (!column.width) {
      switch (column.type) {
        case 'image':
          return '80px';
        case 'boolean':
          return '100px';
        case 'date':
          return '150px';
        default:
          return this.currentScreenSize === 'mobile' ? '120px' : 'auto';
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
    const isExpanded = this.expandedTexts.get(key) || false;
    this.expandedTexts.set(key, !isExpanded);
  }

  protected shouldShowExpandButton(row: any, columnKey: string, column: TableColumn): boolean {
    const text = this.getValue(row, columnKey);
    if (!text) return false;

    const effectiveLength = this.getEffectiveTruncateLength(column);
    return text.length > effectiveLength;
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
    return this.data().length > 0 && this.selection.length === this.data().length;
  }

  protected isIndeterminate(): boolean {
    return this.selection.length > 0 && this.selection.length < this.data().length;
  }

  protected sort(column: string) {
    if (!this.config().sortable) return;
    const direction = this.currentSort?.column === column && this.currentSort.direction === 'asc'
      ? 'desc'
      : 'asc';
    this.currentSort = { column, direction };
    this.sortChange.emit({ column, direction });
  }

  protected getCustomTemplate(templateName?: string): TemplateRef<any> | null {
    if (!templateName) return null;
    return this.customTemplates()[templateName] || null;
  }

  protected toggleSelection(row: any) {
    const idx = this.selection.findIndex(item => this.getRowId(item) === this.getRowId(row));
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
    const baseClass = 'p-2 rounded-full transition-all duration-200 ease-in-out group flex-shrink-0';
    const colorClass = this.getActionColorClass(action.color);
    const disabledClass = 'disabled:opacity-50 disabled:cursor-not-allowed';
    return `${baseClass} ${colorClass} ${disabledClass}`;
  }

  protected getActionsWidth(): string {
    const actionsCount = this.config().actions?.length || 0;
    const baseWidth = this.currentScreenSize === 'mobile' ? 80 : 100;
    return `${Math.max(baseWidth, actionsCount * 40)}px`;
  }

  protected getRowClass(): string {
    let classes = 'cursor-pointer ';
    if (this.config().striped) {
      classes +=
        'odd:bg-neutral-50 even:bg-neutral-100 dark:odd:bg-dark-background-secondary dark:even:bg-dark-background-tertiary ';
    }
    if (this.config().hover) {
      classes += 'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 ';
    }
    return classes.trim();
  }

  private getRowId(row: any): any {
    return row.id || row._id || JSON.stringify(row);
  }

  private getActionColorClass(color?: string): string {
    switch (color) {
      case 'primary':
        return 'text-blue-500 hover:text-blue-600';
      case 'secondary':
        return 'text-gray-500 hover:text-gray-600';
      case 'danger':
        return 'text-red-500 hover:text-red-600';
      case 'success':
        return 'text-green-500 hover:text-green-600';
      case 'warning':
        return 'text-yellow-500 hover:text-yellow-600';
      default:
        return 'text-gray-600 hover:text-gray-700';
    }
  }

  public isSelected(row: any): boolean {
    return this.selection.some(item => this.getRowId(item) === this.getRowId(row));
  }

  public getValue(row: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], row);
  }

  public onRowClick(row: any) {
    this.rowClick.emit(row);
  }
}
