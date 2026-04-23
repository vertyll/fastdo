import { Component, OnDestroy, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-check-select',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field appearance="outline" class="w-full">
      <mat-label>{{ label() }}</mat-label>
      <mat-select [id]="id()" multiple [value]="selectedValues()" (selectionChange)="onSelectionChange($event.value)">
        @for (option of translatedOptions(); track option.value) {
          <mat-option [value]="option.value">{{ option.label }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
})
export class CheckSelectComponent implements OnInit, OnDestroy {
  private readonly translateService = inject(TranslateService);

  public readonly control = input.required<FormControl>();
  public readonly id = input.required<string>();
  public readonly label = input.required<string>();
  public readonly options = input<Array<{ value: any; label: string }>>([]);

  protected readonly translatedOptions = signal<Array<{ value: any; label: string }>>([]);

  protected readonly selectedValues = computed(() => {
    const value = this.control().value;
    if (!value) return [];
    return typeof value === 'string' ? value.split(',').filter(v => v !== '') : value;
  });

  private langChangeSubscription?: Subscription;

  ngOnInit(): void {
    this.translateOptions();
    this.langChangeSubscription = this.translateService.onLangChange.subscribe((_event: LangChangeEvent) => {
      this.translateOptions();
    });
  }

  ngOnDestroy(): void {
    this.langChangeSubscription?.unsubscribe();
  }

  protected onSelectionChange(values: any[]): void {
    this.control().setValue(values.join(','));
  }

  private translateOptions(): void {
    this.translatedOptions.set(
      this.options().map(option => ({
        value: option.value,
        label: this.translateService.instant(option.label),
      })),
    );
  }
}
