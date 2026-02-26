import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ErrorMessageComponent } from '../shared/components/atoms/error.message.component';
import { SpinnerComponent } from '../shared/components/atoms/spinner.component';
import { LOADING_STATE_VALUE } from '../shared/types/list-state.type';
import { TermsAndPolicyService } from './data-access/terms-and-policy.service';
import { TermsAndPolicyStateService } from './data-access/terms-and-policy.state.service';
import { LegalSectionEnum } from './enum/legal-section.enum';
import { Section, SectionTranslation } from './types/terms-and-policies.types';

@Component({
  selector: 'app-privacy-policy-page',
  standalone: true,
  imports: [TranslateModule, SpinnerComponent, ErrorMessageComponent, DatePipe],
  template: `
    @switch (stateService.state()) {
      @case (LOADING_STATE_VALUE.LOADING) {
        <div class="flex justify-center items-center h-48">
          <app-spinner />
        </div>
      }
      @case (LOADING_STATE_VALUE.ERROR) {
        <app-error-message [customMessage]="stateService.error()?.message" />
      }
      @case (LOADING_STATE_VALUE.SUCCESS) {
        <div class="max-w-4xl mx-auto">
          <div class="mb-8">
            <h1 class="text-3xl font-bold">
              {{ 'TermsAndPolicies.privacyPolicy' | translate }}
            </h1>
            <div class="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark space-y-1">
              <p>{{ 'TermsAndPolicies.version' | translate }}: {{ policy().version }}</p>
              <p>
                {{ 'TermsAndPolicies.effectiveDate' | translate }}:
                {{ policy().dateEffective | date: 'mediumDate' : '' : translate.getCurrentLang() }}
              </p>
              <p>
                {{ 'TermsAndPolicies.lastModified' | translate }}:
                {{ policy().dateModification | date: 'mediumDate' : '' : translate.getCurrentLang() }}
              </p>
            </div>
          </div>
          <div class="space-y-8">
            @for (section of sortedSections(); track section.id) {
              <section class="prose dark:prose-invert max-w-none">
                <h2 class="text-xl font-semibold mb-4">
                  {{ getCurrentTranslation(section).title }}
                </h2>

                @switch (section.type) {
                  @case (LegalSection.PARAGRAPH) {
                    <p class="text-text-secondary-light dark:text-text-secondary-dark">
                      {{ getCurrentTranslation(section).content }}
                    </p>
                  }
                  @case (LegalSection.LIST) {
                    <ul class="list-disc pl-6 space-y-2">
                      @for (item of getCurrentTranslation(section).items; track item) {
                        <li class="text-text-secondary-light dark:text-text-secondary-dark">{{ item }}</li>
                      }
                    </ul>
                  }
                  @case (LegalSection.HEADER) {
                    <div class="text-text-secondary-light dark:text-text-secondary-dark">
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

  protected readonly LOADING_STATE_VALUE = LOADING_STATE_VALUE;
  protected readonly LegalSection = LegalSectionEnum;

  protected readonly policy = computed(() => this.stateService.privacyPolicy());

  protected readonly sortedSections = computed(() => {
    const policy = this.stateService.privacyPolicy();
    return policy.sections ? policy.sections.slice().sort((a, b) => a.order - b.order) : [];
  });

  protected getCurrentTranslation(section: Section): SectionTranslation {
    const currentLang = this.translate.getCurrentLang();
    return section.translations.find(t => t.language?.code === currentLang) || section.translations[0];
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
