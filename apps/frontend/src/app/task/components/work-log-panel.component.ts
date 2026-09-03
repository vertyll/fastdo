import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPencil, heroTrash, heroXMark } from '@ng-icons/heroicons/outline';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BadgeComponent } from '../../shared/components/atoms/badge.component';
import { ButtonComponent } from '../../shared/components/atoms/button.component';
import { CheckboxComponent } from '../../shared/components/atoms/checkbox.component';
import { SelectFilterComponent } from '../../shared/components/atoms/select.component';
import { InputFieldComponent } from '../../shared/components/molecules/input-field.component';
import { TextareaFieldComponent } from '../../shared/components/molecules/textarea-field.component';
import { DateFieldComponent } from '../../shared/components/molecules/date-field.component';
import { SpinnerComponent } from '../../shared/components/atoms/spinner.component';
import { ToastTypeEnum } from '../../shared/enums/toast-type.enum';
import { NotificationService } from '../../shared/services/notification.service';
import { TasksService } from '../data-access/task.service';
import { WorkLogEntry } from '../defs/task.defs';
import { formatDuration, parseDuration } from '../utils/duration';
import { toIsoDay } from '../utils/day';

const PAGE_SIZE = 20;
const SCROLL_THRESHOLD_PX = 48;

type DayGroup = {
  day: string;
  totalMinutes: number;
  entries: WorkLogEntry[];
};

@Component({
  selector: 'app-work-log-panel',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    NgIconComponent,
    BadgeComponent,
    ButtonComponent,
    CheckboxComponent,
    SelectFilterComponent,
    DateFieldComponent,
    InputFieldComponent,
    TextareaFieldComponent,
    SpinnerComponent,
  ],
  viewProviders: [provideIcons({ heroPencil, heroTrash, heroXMark })],
  template: `
    <div class="space-y-4 text-left">
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-3">
          <app-input-field
            [control]="form.controls.duration"
            id="workLogDuration"
            [label]="'WorkLog.duration' | translate"
            [placeholder]="'WorkLog.durationPlaceholder' | translate"
          />
          <app-date-field
            [control]="form.controls.workedOn"
            id="workLogWorkedOn"
            [label]="'WorkLog.workedOn' | translate"
          />
        </div>

        <app-textarea-field
          [control]="form.controls.description"
          id="workLogDescription"
          [label]="'WorkLog.description' | translate"
          [placeholder]="'WorkLog.descriptionPlaceholder' | translate"
          [rows]="2"
        />

        @if (hiddenWorkLogEnabled) {
          <div class="py-1">
            <app-checkbox
              [control]="form.controls.hidden"
              id="workLogHidden"
              [label]="'WorkLog.hiddenEntry' | translate"
            />
          </div>
        }

        @if (formError()) {
          <p class="text-xs text-danger-500">{{ formError()! | translate }}</p>
        }

        <div class="flex items-center gap-2 pt-1">
          <app-button type="submit" [disabled]="saving()">
            {{ (editing() ? 'Basic.save' : 'WorkLog.log') | translate }}
          </app-button>
          @if (editing()) {
            <app-button type="button" variant="stroked" (clicked)="cancelEdit()">
              {{ 'Basic.cancel' | translate }}
            </app-button>
          }
        </div>
      </form>

      <div class="border-t border-border-primary dark:border-dark-border-primary pt-4">
        @if (loading()) {
          <div class="flex justify-center py-6"><app-spinner /></div>
        } @else if (failed()) {
          <p class="py-6 text-center text-sm text-danger-500">{{ 'WorkLog.loadError' | translate }}</p>
        } @else if (groups().length === 0) {
          <p class="py-6 text-center text-sm text-text-secondary dark:text-dark-text-secondary">
            {{ 'WorkLog.empty' | translate }}
          </p>
        } @else {
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
            <p class="text-xs text-text-secondary dark:text-dark-text-secondary">
              {{ 'WorkLog.total' | translate }}: <span class="font-semibold">{{ formatted(totalMinutes()) }}</span>
            </p>
            @if (hiddenWorkLogEnabled) {
              <app-select
                class="w-44"
                [control]="visibilityControl"
                id="workLogVisibility"
                [label]="'WorkLog.show' | translate"
                [options]="visibilityOptions"
              />
            }
          </div>
          <ul class="space-y-4 max-h-80 overflow-y-auto" (scroll)="onScroll($event)">
            @for (group of groups(); track group.day) {
              <li>
                <div class="flex items-baseline justify-between mb-1">
                  <span class="text-xs font-semibold text-text-primary dark:text-dark-text-primary">
                    {{ formatDay(group.day) }}
                  </span>
                  <span class="text-xs text-text-secondary dark:text-dark-text-secondary">
                    {{ formatted(group.totalMinutes) }}
                  </span>
                </div>
                <ul class="space-y-1">
                  @for (entry of group.entries; track entry.id) {
                    <li
                      class="flex items-start justify-between gap-2 px-2 py-1.5 rounded-md bg-surface-secondary dark:bg-dark-surface-secondary"
                    >
                      <div class="min-w-0">
                        <p
                          class="grid grid-cols-[3.5rem_1fr] gap-4 text-sm text-text-primary dark:text-dark-text-primary"
                        >
                          <span class="font-medium tabular-nums">{{ formatted(entry.minutes) }}</span>
                          <span class="truncate"
                            >{{ entry.author.displayName }}
                            @if (entry.hidden) {
                              <app-badge class="ml-2">
                                {{ 'WorkLog.hidden' | translate }}
                              </app-badge>
                            }
                          </span>
                        </p>
                        @if (entry.description) {
                          <p
                            class="grid grid-cols-[3.5rem_1fr] gap-4 text-xs text-text-secondary dark:text-dark-text-secondary"
                          >
                            <span></span>
                            <span class="break-words">{{ entry.description }}</span>
                          </p>
                        }
                      </div>
                      @if (canEdit(entry)) {
                        <div class="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            (click)="startEdit(entry)"
                            class="p-1 rounded-md text-text-secondary hover:text-primary-500 dark:text-dark-text-secondary"
                            [attr.aria-label]="'Basic.edit' | translate"
                          >
                            <ng-icon name="heroPencil" size="14" />
                          </button>
                          <button
                            type="button"
                            (click)="remove(entry)"
                            class="p-1 rounded-md text-text-secondary hover:text-danger-500 dark:text-dark-text-secondary"
                            [attr.aria-label]="'Basic.delete' | translate"
                          >
                            <ng-icon name="heroTrash" size="14" />
                          </button>
                        </div>
                      }
                    </li>
                  }
                </ul>
            @if (loadingMore()) {
              <div class="flex justify-center py-2"><app-spinner /></div>
            }
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
})
export class WorkLogPanelComponent implements OnInit {
  private readonly tasksService = inject(TasksService);
  private readonly translateService = inject(TranslateService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  public taskId!: string;
  public currentUserId: string | null = null;
  public hiddenWorkLogEnabled = false;
  public onChange: (() => void) | null = null;

  protected readonly entries = signal<WorkLogEntry[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadingMore = signal(false);
  protected readonly failed = signal(false);

  private page = 0;
  private total = 0;

  protected readonly visibilityControl = new FormControl<'all' | 'hidden' | 'visible'>('all', { nonNullable: true });

  protected readonly visibilityOptions = [
    { value: 'all', label: 'WorkLog.showAll' },
    { value: 'visible', label: 'WorkLog.showVisible' },
    { value: 'hidden', label: 'WorkLog.showHidden' },
  ];
  protected readonly saving = signal(false);
  protected readonly editing = signal<WorkLogEntry | null>(null);
  protected readonly formError = signal<string | null>(null);

  protected readonly form = new FormGroup({
    duration: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    workedOn: new FormControl(new Date(), { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    hidden: new FormControl(false, { nonNullable: true }),
  });

  protected readonly totalMinutes = signal(0);

  protected readonly groups = computed<DayGroup[]>(() => {
    const byDay = new Map<string, WorkLogEntry[]>();
    for (const entry of this.entries()) {
      byDay.set(entry.workedOn, [...(byDay.get(entry.workedOn) ?? []), entry]);
    }
    return [...byDay.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([day, entries]) => ({
        day,
        entries,
        totalMinutes: entries.reduce((sum, e) => sum + e.minutes, 0),
      }));
  });

  public ngOnInit(): void {
    this.visibilityControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load());
    this.load();
  }

  protected formatted(minutes: number): string {
    return formatDuration(minutes);
  }

  protected formatDay(day: string): string {
    return new Date(day).toLocaleDateString(this.translateService.getCurrentLang() || 'pl', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  protected canEdit(entry: WorkLogEntry): boolean {
    return this.currentUserId !== null && entry.author.id === this.currentUserId;
  }

  protected startEdit(entry: WorkLogEntry): void {
    this.editing.set(entry);
    this.formError.set(null);
    this.form.setValue({
      duration: formatDuration(entry.minutes),
      workedOn: new Date(entry.workedOn),
      description: entry.description ?? '',
      hidden: entry.hidden,
    });
  }

  protected cancelEdit(): void {
    this.editing.set(null);
    this.formError.set(null);
    this.form.setValue({ duration: '', workedOn: new Date(), description: '', hidden: false });
  }

  protected submit(): void {
    const minutes = parseDuration(this.form.controls.duration.value);
    if (minutes === null) {
      this.formError.set('WorkLog.durationInvalid');
      return;
    }

    this.formError.set(null);
    this.saving.set(true);

    const payload = {
      minutes,
      workedOn: toIsoDay(this.form.controls.workedOn.value),
      description: this.form.controls.description.value.trim() || null,
      hidden: this.form.controls.hidden.value,
    };
    const entry = this.editing();
    const request$ = entry
      ? this.tasksService.updateWorkLogEntry(entry.id, payload, entry.version)
      : this.tasksService.logWork(this.taskId, payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.cancelEdit();
        this.load();
        this.onChange?.();
      },
      error: error => {
        this.saving.set(false);
        this.notificationService.showNotification(
          this.translateService.instant('WorkLog.saveError'),
          ToastTypeEnum.Error,
        );
        console.error('Work log save failed:', error);
      },
    });
  }

  protected remove(entry: WorkLogEntry): void {
    this.tasksService
      .deleteWorkLogEntry(entry.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.editing()?.id === entry.id) {
            this.cancelEdit();
          }
          this.load();
          this.onChange?.();
        },
        error: error => {
          this.notificationService.showNotification(
            this.translateService.instant('WorkLog.deleteError'),
            ToastTypeEnum.Error,
          );
          console.error('Work log delete failed:', error);
        },
      });
  }

  private load(): void {
    this.loading.set(true);
    this.failed.set(false);
    this.page = 0;
    this.tasksService
      .getWorkLog(this.taskId, 0, PAGE_SIZE, this.hiddenFilter())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.loading.set(false);
          this.entries.set(response.data.content);
          this.total = response.data.totalElements;
          this.totalMinutes.set(response.data.totalMinutes);
        },
        error: () => {
          this.loading.set(false);
          this.failed.set(true);
        },
      });
  }

  private hiddenFilter(): boolean | undefined {
    switch (this.visibilityControl.value) {
      case 'hidden':
        return true;
      case 'visible':
        return false;
      default:
        return undefined;
    }
  }

  protected onScroll(event: Event): void {
    const list = event.target as HTMLElement;
    const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < SCROLL_THRESHOLD_PX;
    if (nearBottom) {
      this.loadMore();
    }
  }

  private loadMore(): void {
    if (this.loadingMore() || this.entries().length >= this.total) {
      return;
    }

    this.loadingMore.set(true);
    this.tasksService
      .getWorkLog(this.taskId, this.page + 1, PAGE_SIZE, this.hiddenFilter())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.loadingMore.set(false);
          this.page += 1;
          this.total = response.data.totalElements;
          this.totalMinutes.set(response.data.totalMinutes);
          this.entries.update(current => [...current, ...response.data.content]);
        },
        error: () => this.loadingMore.set(false),
      });
  }
}
