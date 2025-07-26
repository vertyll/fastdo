import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroChevronDoubleLeftSolid,
  heroChevronDoubleRightSolid,
  heroChevronLeftSolid,
  heroChevronRightSolid,
} from '@ng-icons/heroicons/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DEFAULT_PAGE_SIZE } from '../../../app.contansts';
import { PaginationParams } from '../../types/filter.type';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, TranslatePipe],
  providers: [
    provideIcons({
      heroChevronDoubleLeftSolid,
      heroChevronLeftSolid,
      heroChevronRightSolid,
      heroChevronDoubleRightSolid,
    }),
  ],
  template: `
    <div class="flex flex-col items-center gap-spacing-4 md:flex-row md:items-center md:justify-center px-spacing-4 py-spacing-2 bg-background-primary dark:bg-dark-background-primary border border-border-primary dark:border-dark-border-primary md:px-spacing-6 rounded-borderRadius-lg">
      <div class="flex flex-wrap items-center gap-spacing-2">
        <label class="text-sm text-text-secondary dark:text-dark-text-secondary">{{ 'Paginator.itemsPerPage' | translate }}:</label>
        <div class="relative">
          <select
            [ngModel]="pageSize()"
            (ngModelChange)="onPageSizeChange($event)"
            class="block w-20 appearance-none rounded-borderRadius-md border border-border-primary dark:border-dark-border-primary bg-background-secondary dark:bg-dark-background-secondary hover:bg-background-primary hover:dark:bg-dark-background-primary py-1.5 pl-3 pr-8 text-text-primary dark:text-dark-text-primary focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-200 dark:focus:ring-primary-800 md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @for (size of pageSizeOptions(); track size) {
              <option [value]="size">{{ size }}</option>
            }
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <svg
              class="h-4 w-4 text-text-secondary dark:text-dark-text-secondary"
              viewBox="0 0 20 20"
              stroke="currentColor"
            >
              <path d="M7 7l3 3 3-3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <span class="text-sm text-text-secondary dark:text-dark-text-secondary whitespace-nowrap">
          {{ getRangeLabel(currentPage(), pageSize(), total()) }}
        </span>
      </div>

      <div class="flex items-center gap-spacing-1.5 md:gap-spacing-2">
        <button
          (click)="onFirstPage()"
          [disabled]="currentPage() === 0"
          class="relative inline-flex items-center justify-center rounded-borderRadius-md w-8 h-8 md:w-9 md:h-9 text-text-primary dark:text-dark-text-primary border border-border-primary dark:border-dark-border-primary bg-background-primary dark:bg-dark-background-primary hover:bg-background-secondary dark:hover:bg-dark-background-secondary focus:z-20 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-background-primary dark:disabled:hover:bg-dark-background-primary"
        >
          <span class="sr-only">{{ 'Paginator.firstPage' | translate }}</span>
          <ng-icon
            name="heroChevronDoubleLeftSolid"
            size="16"
            class="text-current"
          />
        </button>

        <button
          (click)="onPreviousPage()"
          [disabled]="currentPage() === 0"
          class="relative inline-flex items-center justify-center rounded-borderRadius-md w-8 h-8 md:w-9 md:h-9 text-text-primary dark:text-dark-text-primary border border-border-primary dark:border-dark-border-primary bg-background-primary dark:bg-dark-background-primary hover:bg-background-secondary dark:hover:bg-dark-background-secondary focus:z-20 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-background-primary dark:disabled:hover:bg-dark-background-primary"
        >
          <span class="sr-only">{{ 'Paginator.previousPage' | translate }}</span>
          <ng-icon
            name="heroChevronLeftSolid"
            size="16"
            class="text-current"
          />
        </button>

        <button
          (click)="onNextPage()"
          [disabled]="isLastPage() || total() === 0"
          class="relative inline-flex items-center justify-center rounded-borderRadius-md w-8 h-8 md:w-9 md:h-9 text-text-primary dark:text-dark-text-primary border border-border-primary dark:border-dark-border-primary bg-background-primary dark:bg-dark-background-primary hover:bg-background-secondary dark:hover:bg-dark-background-secondary focus:z-20 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-background-primary dark:disabled:hover:bg-dark-background-primary"
        >
          <span class="sr-only">{{ 'Paginator.nextPage' | translate }}</span>
          <ng-icon
            name="heroChevronRightSolid"
            size="16"
            class="text-current"
          />
        </button>

        <button
          (click)="onLastPage()"
          [disabled]="isLastPage() || total() === 0"
          class="relative inline-flex items-center justify-center rounded-borderRadius-md w-8 h-8 md:w-9 md:h-9 text-text-primary dark:text-dark-text-primary border border-border-primary dark:border-dark-border-primary bg-background-primary dark:bg-dark-background-primary hover:bg-background-secondary dark:hover:bg-dark-background-secondary focus:z-20 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-background-primary dark:disabled:hover:bg-dark-background-primary"
        >
          <span class="sr-only">{{ 'Paginator.lastPage' | translate }}</span>
          <ng-icon
            name="heroChevronDoubleRightSolid"
            size="16"
            class="text-current"
          />
        </button>
      </div>
    </div>
  `,
})
export class PaginatorComponent {
  readonly total = input<number>(0);
  readonly pageSize = input<number>(10);
  readonly currentPage = input<number>(0);
  readonly pageSizeOptions = input<number[]>(DEFAULT_PAGE_SIZE);
  readonly pageChange = output<PaginationParams>();

  private readonly translateService = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateLabels();
      });
  }

  private updateLabels(): void {
    this.getRangeLabel(this.currentPage(), this.pageSize(), this.total());
  }

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return this.translateService.instant('Paginator.page1Of1');
    }
    const amountPages = Math.ceil(length / pageSize);
    return this.translateService.instant('Paginator.pageXOfY', {
      page: page + 1,
      amountPages,
    });
  }

  isLastPage(): boolean {
    const totalPages = Math.ceil(this.total() / this.pageSize());
    return this.currentPage() >= totalPages - 1 || totalPages === 0;
  }

  onPageSizeChange(newPageSize: number): void {
    const newPage = Math.floor((this.currentPage() * this.pageSize()) / newPageSize);
    this.pageChange.emit({
      page: newPage,
      pageSize: newPageSize,
    });
  }

  onFirstPage(): void {
    if (this.currentPage() !== 0) {
      this.pageChange.emit({
        page: 0,
        pageSize: this.pageSize(),
      });
    }
  }

  onPreviousPage(): void {
    if (this.currentPage() > 0) {
      this.pageChange.emit({
        page: this.currentPage() - 1,
        pageSize: this.pageSize(),
      });
    }
  }

  onNextPage(): void {
    if (!this.isLastPage() && this.total() > 0) {
      this.pageChange.emit({
        page: this.currentPage() + 1,
        pageSize: this.pageSize(),
      });
    }
  }

  onLastPage(): void {
    const lastPage = Math.ceil(this.total() / this.pageSize()) - 1;
    if (this.currentPage() !== lastPage && lastPage >= 0) {
      this.pageChange.emit({
        page: lastPage,
        pageSize: this.pageSize(),
      });
    }
  }
}
