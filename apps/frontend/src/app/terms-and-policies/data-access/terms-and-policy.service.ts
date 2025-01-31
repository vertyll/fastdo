import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../../shared/types/api-response.type';
import { PrivacyPolicy } from '../model/Privacy-policy';
import { Terms } from '../model/Terms';
import { TermsAndPolicyApiService } from './terms-and-policy.api.service';
import { TermsAndPolicyStateService } from './terms-and-policy.state.service';

@Injectable({
  providedIn: 'root',
})
export class TermsAndPolicyService {
  private readonly httpService = inject(TermsAndPolicyApiService);
  private readonly state = inject(TermsAndPolicyStateService);

  public getTerms(): Observable<ApiResponse<Terms>> {
    return this.httpService.getTerms().pipe(
      tap(response => {
        this.state.setTerms(response.data);
      }),
    );
  }

  public getPrivacyPolicy(): Observable<ApiResponse<PrivacyPolicy>> {
    return this.httpService.getPrivacyPolicy().pipe(
      tap(response => {
        this.state.setPrivacyPolicy(response.data);
      }),
    );
  }
}
