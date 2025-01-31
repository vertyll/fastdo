import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { SpinnerComponent } from '../shared/components/atoms/spinner.component';
import { LIST_STATE_VALUE } from '../shared/types/list-state.type';
import { TermsAndPolicyService } from './data-access/terms-and-policy.service';
import { TermsAndPolicyStateService } from './data-access/terms-and-policy.state.service';
import { LegalSection } from './enum/legal-section.enum';
import { Section, SectionTranslation } from './types/terms-and-policies.types';

@Component({
  selector: 'app-privacy-policy-page',
  standalone: true,
  imports: [
    TranslateModule,
    SpinnerComponent,
    ErrorMessageComponent,
    DatePipe,
  ],
  template: `
    @switch (stateService.state()) {
      @case (LIST_STATE_VALUE.LOADING) {
        <div class="flex justify-center items-center h-48">
          <app-spinner />
        </div>
      }
      @case (LIST_STATE_VALUE.ERROR) {
        <app-error-message [customMessage]="stateService.error()?.message" />
      }
      @case (LIST_STATE_VALUE.SUCCESS) {
        <div class="max-w-4xl mx-auto p-6">
          <div class="mb-8">
            <h1 class="text-3xl font-bold">
              {{ 'TermsAndPolicies.privacyPolicy' | translate }}
            </h1>
            <div class="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>{{ 'TermsAndPolicies.version' | translate }}: {{ policy().version }}</p>
              <p>{{ 'TermsAndPolicies.effectiveDate' | translate }}:
                {{ policy().dateEffective | date:'mediumDate':'':translate.currentLang }}
              </p>
              <p>{{ 'TermsAndPolicies.lastModified' | translate }}:
                {{ policy().dateModification | date:'mediumDate':'':translate.currentLang }}
              </p>
            </div>
          </div>
          <div class="space-y-8">
            @for(section of sortedSections(); track section.id) {
              <section class="prose dark:prose-invert max-w-none">
                <h2 class="text-xl font-semibold mb-4">
                  {{ getCurrentTranslation(section).title }}
                </h2>

                @switch (section.type) {
                  @case (LegalSection.PARAGRAPH) {
                    <p class="text-gray-600 dark:text-gray-300">
                      {{ getCurrentTranslation(section).content }}
                    </p>
                  }
                  @case (LegalSection.LIST) {
                    <ul class="list-disc pl-6 space-y-2">
                      @for(item of getCurrentTranslation(section).items; track item) {
                        <li class="text-gray-600 dark:text-gray-300">{{ item }}</li>
                      }
                    </ul>
                  }
                  @case (LegalSection.HEADER) {
                    <div class="text-gray-600 dark:text-gray-300">
                      {{ getCurrentTranslation(section).content }}
                    </div>
                  }
                }
              </section>
            }
          </div>
        </div>
      }
    }
  `,
})
export class PrivacyPolicyPageComponent implements OnInit, OnDestroy {
  private readonly policyService = inject(TermsAndPolicyService);
  protected readonly stateService = inject(TermsAndPolicyStateService);
  protected readonly translate = inject(TranslateService);

  protected readonly LIST_STATE_VALUE = LIST_STATE_VALUE;
  protected readonly LegalSection = LegalSection;

  protected readonly policy = computed(() => this.stateService.privacyPolicy());

  protected readonly sortedSections = computed(() => {
    const policy = this.stateService.privacyPolicy();
    return policy.sections?.sort((a, b) => a.order - b.order) || [];
  });

  protected getCurrentTranslation(section: Section): SectionTranslation {
    const currentLang = this.translate.currentLang;
    return section.translations.find(t => t.languageCode === currentLang)
      || section.translations[0];
  }

  private langChangeSubscription!: Subscription;

  ngOnInit(): void {
    this.loadPrivacyPolicy();
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadPrivacyPolicy();
    });
  }

  ngOnDestroy(): void {
    this.langChangeSubscription?.unsubscribe();
  }

  private loadPrivacyPolicy(): void {
    this.policyService.getPrivacyPolicy().subscribe();
  }
}
