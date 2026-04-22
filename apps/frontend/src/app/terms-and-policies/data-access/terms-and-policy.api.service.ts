import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import { PrivacyPolicy, Terms } from '../defs/terms-and-policies.defs';
import { HttpApiService } from '../../shared/services/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class TermsAndPolicyApiService extends HttpApiService {
  public getTerms(): Observable<ApiResponse<Terms>> {
    return this.withLoadingState(this.http.get<ApiResponse<Terms>>(`${this.baseUrl}/terms-and-policies/terms`));
  }

  public getPrivacyPolicy(): Observable<ApiResponse<PrivacyPolicy>> {
    return this.withLoadingState(
      this.http.get<ApiResponse<PrivacyPolicy>>(`${this.baseUrl}/terms-and-policies/privacy-policy`),
    );
  }
}
