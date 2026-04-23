import { Component, computed, input, output, TemplateRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TableColumn, TableComponent, TableConfig } from 'src/app/shared/components/organisms/table.component';
import { Task, TaskPriorityCodeEnum } from '../defs/task.defs';
import { MOBILE_BREAKPOINT } from '../../app.contansts';

@Component({
  selector: 'app-task-table',
  standalone: true,
  imports: [TableComponent, TranslateModule],
  template: `
    <app-table
      [data]="tasks()"
      [config]="tableConfig()"
      [loading]="loading()"
      [customTemplates]="customTemplates()"
      [initialSort]="currentSort()"
      (loadMore)="loadMore.emit()"
      (rowClick)="onTaskClick($event)"
      (actionClick)="onActionClick($event)"
      (sortChange)="sortChange.emit($event)"
      (selectionChange)="selectionChange.emit($event)"
    />
  `,
})
export class TaskTableComponent {
  public readonly tasks = input.required<Task[]>();
  public readonly loading = input(false);
  public readonly loadingMore = input(false);
  public readonly hasMore = input(true);
  public readonly customTemplates = input<{ [key: string]: TemplateRef<any> }>({});
  public readonly currentSort = input<{ column: string; direction: 'asc' | 'desc' } | null>(null);

  public readonly loadMore = output<void>();
  public readonly taskClick = output<Task>();
  public readonly actionClick = output<{ action: string; row: Task }>();
  public readonly sortChange = output<{ column: string; direction: 'asc' | 'desc' }>();
  public readonly selectionChange = output<Task[]>();

  protected readonly tableConfig = computed<TableConfig>(() => ({
    columns: this.getTableColumns(),
    actions: [
      {
        key: 'view',
        label: 'Basic.view',
        icon: 'heroEye',
        color: 'primary',
      },
    ],
    selectable: true,
    sortable: true,
    infiniteScroll: true,
    loadingMore: this.loadingMore(),
    hover: true,
    striped: true,
    responsiveBreakpoint: MOBILE_BREAKPOINT,
    rowClassFunction: (row: Task) => this.getRowClassByPriority(row),
  }));

  private getTableColumns(): TableColumn[] {
    return [
      {
        key: 'id',
        label: 'Task.id',
        type: 'text',
        sortable: true,
        width: '6rem',
        priority: 1,
        align: 'center',
      },
      {
        key: 'description',
        label: 'Task.description',
        type: 'text',
        sortable: true,
        truncate: { maxLines: 2, maxChars: 80 },
        priority: 2,
      },
      {
        key: 'status',
        label: 'Task.status',
        type: 'custom',
        customTemplate: 'status',
        sortable: false,
        align: 'center',
        width: '8rem',
        priority: 3,
      },
      {
        key: 'assignedUsers',
        label: 'Task.assignedUsers',
        type: 'custom',
        customTemplate: 'assignedUsers',
        sortable: false,
        align: 'center',
        width: '10rem',
        priority: 4,
        hideOn: 'mobile',
      },
      {
        key: 'dateCreation',
        label: 'Task.dateCreation',
        type: 'date',
        sortable: true,
        hideOn: 'mobile',
        align: 'center',
        width: '10rem',
        priority: 5,
      },
      {
        key: 'dateModification',
        label: 'Task.dateModification',
        type: 'date',
        sortable: true,
        hideOn: 'mobile',
        align: 'center',
        width: '10rem',
        priority: 6,
      },
    ];
  }

  protected onTaskClick(task: Task): void {
    this.taskClick.emit(task);
  }

  protected onActionClick(event: { action: string; row: Task }): void {
    this.actionClick.emit(event);
  }

  private getRowClassByPriority(task: Task): string {
    if (!task.priority) return '';

    switch (task.priority.code) {
      case TaskPriorityCodeEnum.HIGH:
        return 'priority-high';
      case TaskPriorityCodeEnum.LOW:
        return 'priority-low';
      case TaskPriorityCodeEnum.MEDIUM:
      default:
        return '';
    }
  }
}
