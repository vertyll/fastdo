import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-select-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative">
      <select
        [formControl]="control"
        [id]="id"
        class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
      >
        @for (option of translatedOptions; track $index) {
          <option [value]="option.value">
            {{ option.label }}
          </option>
        }
      </select>
      <label
        [for]="id"
        class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-4"
        >{{ label }}</label
      >
    </div>
  `,
})
export class SelectFilterComponent implements OnInit, OnDestroy {
  @Input()
  control!: FormControl;
  @Input()
  id!: string;
  @Input()
  label!: string;
  @Input()
  options: Array<{ value: any; label: string }> = [];

  translatedOptions: Array<{ value: any; label: string }> = [];
  private langChangeSubscription!: Subscription;

  constructor(private readonly translateService: TranslateService) {}

  ngOnInit(): void {
    this.translateOptions();
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      (event: LangChangeEvent) => {
        this.translateOptions();
      },
    );
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  private translateOptions(): void {
    this.translatedOptions = this.options.map((option) => ({
      value: option.value,
      label: this.translateService.instant(option.label),
    }));
  }
}
