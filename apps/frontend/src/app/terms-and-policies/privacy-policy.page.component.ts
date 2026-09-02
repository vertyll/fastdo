import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LegalDocumentComponent } from './legal-document.component';

@Component({
  selector: 'app-privacy-policy-page',
  imports: [LegalDocumentComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <app-legal-document
      titleKey="TermsAndPolicies.privacyPolicy"
      sectionsKey="TermsAndPolicies.privacyPolicySections"
    />
  `,
})
export class PrivacyPolicyPageComponent {}
