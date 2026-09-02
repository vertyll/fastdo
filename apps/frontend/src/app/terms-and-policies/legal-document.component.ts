import { Component, computed, inject, input } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LegalSection } from './defs/terms-and-policies.defs';

@Component({
  selector: 'app-legal-document',
  imports: [TranslatePipe],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold">{{ titleKey() | translate }}</h1>
        <p class="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {{ 'TermsAndPolicies.lastModified' | translate }}: {{ 'TermsAndPolicies.lastModifiedDate' | translate }}
        </p>
      </div>

      <div class="space-y-8">
        @for (section of sections(); track section.title) {
          <section class="prose dark:prose-invert max-w-none">
            <h2 class="text-xl font-semibold mb-4">{{ section.title }}</h2>

            @if (section.content) {
              <p class="text-text-secondary-light dark:text-text-secondary-dark">{{ section.content }}</p>
            }

            @if (section.items?.length) {
              <ul class="list-disc pl-6 space-y-2">
                @for (item of section.items; track item) {
                  <li class="text-text-secondary-light dark:text-text-secondary-dark">{{ item }}</li>
                }
              </ul>
            }
          </section>
        }
      </div>
    </div>
  `,
})
export class LegalDocumentComponent {
  private readonly translate = inject(TranslateService);

  public readonly titleKey = input.required<string>();
  public readonly sectionsKey = input.required<string>();

  private readonly currentLang = toSignal(this.translate.onLangChange, { initialValue: null });

  public readonly sections = computed<LegalSection[]>(() => {
    this.currentLang();
    const value = this.translate.instant(this.sectionsKey());
    return Array.isArray(value) ? value : [];
  });
}
