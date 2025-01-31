import { Injectable, computed, inject, signal } from '@angular/core';
import { LIST_STATE_VALUE } from 'src/app/shared/types/list-state.type';
import { PrivacyPolicy } from '../model/Privacy-policy';
import { Terms } from '../model/Terms';
import { TermsAndPolicyApiService } from './terms-and-policy.api.service';

@Injectable({ providedIn: 'root' })
export class TermsAndPolicyStateService {
  private readonly apiService = inject(TermsAndPolicyApiService);

  private readonly termsSignal = signal<Terms>({} as Terms);
  private readonly privacyPolicySignal = signal<PrivacyPolicy>({} as PrivacyPolicy);

  public terms = computed(() => this.termsSignal());
  public privacyPolicy = computed(() => this.privacyPolicySignal());
  public state = computed(() =>
    this.apiService.$idle()
      ? LIST_STATE_VALUE.IDLE
      : this.apiService.$loading()
      ? LIST_STATE_VALUE.LOADING
      : this.apiService.$error()
      ? LIST_STATE_VALUE.ERROR
      : LIST_STATE_VALUE.SUCCESS
  );
  public error = computed(() => this.apiService.$error());

  public setTerms(projects: Terms): void {
    this.termsSignal.set(projects);
  }

  public setPrivacyPolicy(projects: PrivacyPolicy): void {
    this.privacyPolicySignal.set(projects);
  }
}
