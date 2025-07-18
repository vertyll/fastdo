import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrivacyPolicyDto } from '../dtos/privacy-policy.dto';
import { TermsDto } from '../dtos/terms.dto';
import { PrivacyPolicyRepository } from '../repositories/privacy-policy.repository';
import { TermsRepository } from '../repositories/terms.repository';

@Injectable()
export class TermsAndPoliciesService {
  constructor(
    private readonly termsRepository: TermsRepository,
    private readonly privacyPolicyRepository: PrivacyPolicyRepository,
    private readonly i18n: I18nService,
  ) {}

  public async getLatestTerms(): Promise<TermsDto> {
    const terms = await this.termsRepository.getLatestTerms();
    if (!terms) throw new NotFoundException(this.i18n.t('messages.TermsAndPolicies.errors.termsNotFound'));
    return terms;
  }

  public async getLatestPrivacyPolicy(): Promise<PrivacyPolicyDto> {
    const policy = await this.privacyPolicyRepository.getLatestPrivacyPolicy();
    if (!policy) throw new NotFoundException(this.i18n.t('messages.TermsAndPolicies.errors.privacyPolicyNotFound'));
    return policy;
  }
}
