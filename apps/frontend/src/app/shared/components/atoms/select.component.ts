import { Component, OnDestroy, OnInit, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-select',
  imports: [ReactiveFormsModule],
  template: `
    <select
      [formControl]="control()"
      [id]="id()"
      class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-orange-600 peer"
    >
      @for (option of translatedOptions; track $index) {
        <option [value]="option.value">
          {{ option.label }}
        </option>
      }
    </select>
  `,
})
export class SelectFilterComponent implements OnInit, OnDestroy {
  private readonly translateService = inject(TranslateService);

  readonly control = input.required<FormControl>();
  readonly id = input.required<string>();
  readonly options = input<
    Array<{
      value: any;
      label: string;
    }>
  >([]);

  protected translatedOptions: Array<{ value: any; label: string; }> = [];
  private langChangeSubscription!: Subscription;

  ngOnInit(): void {
    this.translateOptions();
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      (_event: LangChangeEvent) => {
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
    this.translatedOptions = this.options().map(option => ({
      value: option.value,
      label: this.translateService.instant(option.label),
    }));
  }
}
