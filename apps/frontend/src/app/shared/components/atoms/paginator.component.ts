import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PaginationParams } from '../../types/filter.type';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [MatPaginatorModule, TranslateModule],
  providers: [
    {
      provide: MatPaginatorIntl,
      useExisting: PaginatorComponent,
    },
  ],
  template: `
    <mat-paginator
      [length]="total()"
      [pageSize]="pageSize()"
      [pageIndex]="currentPage()"
      [pageSizeOptions]="[5, 10, 25, 50, 100]"
      [showFirstLastButtons]="true"
      (page)="handlePageEvent($event)"
      aria-label="Select page"
    ></mat-paginator>
  `,
})
export class PaginatorComponent extends MatPaginatorIntl {
  readonly total = input<number>(0);
  readonly pageSize = input<number>(10);
  readonly currentPage = input<number>(0);
  readonly pageChange = output<PaginationParams>();

  private readonly translateService = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    super();
    this.updateTranslations();

    this.translateService.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateTranslations();
        this.changes.next();
      });
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0) {
      return this.translateService.instant('paginator.page1Of1');
    }
    const amountPages = Math.ceil(length / pageSize);
    return this.translateService.instant('paginator.pageXOfY', {
      page: page + 1,
      amountPages,
    });
  };

  private updateTranslations(): void {
    this.firstPageLabel = this.translateService.instant('paginator.firstPage');
    this.itemsPerPageLabel = this.translateService.instant('paginator.itemsPerPage');
    this.lastPageLabel = this.translateService.instant('paginator.lastPage');
    this.nextPageLabel = this.translateService.instant('paginator.nextPage');
    this.previousPageLabel = this.translateService.instant('paginator.previousPage');
  }

  handlePageEvent(event: PageEvent): void {
    this.pageChange.emit({
      page: event.pageIndex,
      pageSize: event.pageSize,
    });
  }
}
