import { Component } from '@angular/core';
import { LegalDocumentComponent } from './legal-document.component';

@Component({
  selector: 'app-terms-page',
  imports: [LegalDocumentComponent],
  template: ` <app-legal-document titleKey="TermsAndPolicies.terms" sectionsKey="TermsAndPolicies.termsSections" /> `,
})
export class TermsPageComponent {}
