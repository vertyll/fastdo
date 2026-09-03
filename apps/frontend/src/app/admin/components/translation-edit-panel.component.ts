import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { InputFieldComponent } from '../../shared/components/molecules/input-field.component';
import { argumentDrift, bracesBalanced } from '../utils/icu';

export type EditTarget = {
  key: string;
  language: string;
  defaultValue: string | null;
  effectiveValue: string | null;
  version: number | null;
};

type EditRow = EditTarget & {
  control: FormControl<string>;
};

type EditGroup = {
  key: string;
  rows: EditRow[];
};

@Component({
  selector: 'app-translation-edit-panel',
  imports: [ReactiveFormsModule, TranslatePipe, InputFieldComponent],
  template: `
    <div class="space-y-5 text-left max-h-[55vh] overflow-y-auto pr-1">
      @for (group of groups(); track group.key) {
        <section class="pb-4 border-b border-border-primary dark:border-dark-border-primary last:border-b-0">
          <p class="font-mono text-xs font-semibold text-text-primary dark:text-dark-text-primary break-all mb-2">
            {{ group.key }}
          </p>

          <div class="space-y-3 pl-3 border-l-2 border-border-primary dark:border-dark-border-primary">
            @for (row of group.rows; track row.language) {
              <div class="space-y-1">
                <span class="text-xs font-semibold uppercase text-text-secondary dark:text-dark-text-secondary">
                  {{ row.language }}
                </span>

                <app-input-field
                  [control]="row.control"
                  [id]="'edit-' + row.key + '-' + row.language"
                  [label]="'Admin.value' | translate"
                />

                @if (errorFor(row); as error) {
                  <p class="text-xs text-danger-500">{{ error }}</p>
                }
                @if (row.defaultValue) {
                  <p class="text-xs text-text-secondary dark:text-dark-text-secondary break-words">
                    {{ 'Admin.shippedDefault' | translate }}: {{ row.defaultValue }}
                  </p>
                }
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class TranslationEditPanelComponent implements OnInit {
  private readonly translateService = inject(TranslateService);

  public targets: EditTarget[] = [];

  public register: ((panel: TranslationEditPanelComponent) => void) | null = null;

  protected readonly rows = signal<EditRow[]>([]);

  protected readonly groups = computed<EditGroup[]>(() => {
    const byKey = new Map<string, EditRow[]>();
    for (const row of this.rows()) {
      byKey.set(row.key, [...(byKey.get(row.key) ?? []), row]);
    }
    return [...byKey.entries()].map(([key, rows]) => ({ key, rows }));
  });
  protected readonly errors = signal<ReadonlyMap<string, string>>(new Map());

  public ngOnInit(): void {
    this.register?.(this);
    this.rows.set(
      this.targets.map(target => ({
        ...target,
        control: new FormControl(target.effectiveValue ?? '', { nonNullable: true }),
      })),
    );
  }

  public collect(): EditTarget[] | null {
    const problems = new Map<string, string>();

    for (const row of this.rows()) {
      const problem = this.validate(row.defaultValue, row.control.value);
      if (problem) {
        problems.set(this.idOf(row), problem);
      }
    }

    this.errors.set(problems);
    if (problems.size) {
      return null;
    }

    return this.rows().map(row => ({ ...row, effectiveValue: row.control.value }));
  }

  protected errorFor(row: EditRow): string | null {
    return this.errors().get(this.idOf(row)) ?? null;
  }

  private idOf(row: EditTarget): string {
    return `${row.key}|${row.language}`;
  }

  private validate(defaultValue: string | null, candidate: string): string | null {
    if (!bracesBalanced(candidate)) {
      return this.translateService.instant('Admin.unbalancedBraces');
    }

    const drift = argumentDrift(defaultValue, candidate);
    if (!drift) {
      return null;
    }

    return this.translateService.instant('Admin.argumentDrift', {
      missing: drift.missing.join(', ') || '-',
      unexpected: drift.unexpected.join(', ') || '-',
    });
  }
}
