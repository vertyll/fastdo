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
    <div class="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-center px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 md:px-6 rounded-md dark:border-white">      <div class="flex flex-wrap items-center gap-2">
        <label class="text-sm text-gray-700 dark:text-gray-300">{{ 'Paginator.itemsPerPage' | translate }}:</label>
        <div class="relative">
          <select
            [ngModel]="pageSize()"
            (ngModelChange)="onPageSizeChange($event)"
            class="block w-20 appearance-none rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-600 hover:bg-gray-100 hover:dark:bg-gray-700 py-1.5 pl-3 pr-8 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option *ngFor="let size of pageSizeOptions()" [value]="size">{{ size }}</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <svg
              class="h-4 w-4 text-gray-400 dark:text-gray-500"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
            >
              <path d="M7 7l3 3 3-3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <span class="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
          {{ getRangeLabel(currentPage(), pageSize(), total()) }}
        </span>
      </div>

      <div class="flex items-center gap-1.5 md:gap-2">
        <button
          (click)="onFirstPage()"
          [disabled]="currentPage() === 0"
          class="relative inline-flex items-center justify-center rounded-md w-8 h-8 md:w-9 md:h-9 text-black dark:text-white border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-20 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-700"
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
          class="relative inline-flex items-center justify-center rounded-md w-8 h-8 md:w-9 md:h-9 text-black dark:text-white border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-20 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-700"
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
          class="relative inline-flex items-center justify-center rounded-md w-8 h-8 md:w-9 md:h-9 text-black dark:text-white border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-20 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-700"
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
          class="relative inline-flex items-center justify-center rounded-md w-8 h-8 md:w-9 md:h-9 text-black dark:text-white border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-20 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-700"
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
