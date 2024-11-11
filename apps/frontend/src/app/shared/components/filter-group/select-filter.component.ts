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
    <div>
      <select [formControl]="control" [id]="id">
        @for (option of translatedOptions; track $index) {
          <option [value]="option.value">
            {{ option.label }}
          </option>
        }
      </select>
      <label [for]="id">{{ label }}</label>
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
