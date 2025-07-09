import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrivacyPolicyWithTranslationsDto } from '../dtos/privacy-policy-with-translations.dto';
import { TermsWithTranslationsDto } from '../dtos/terms-with-translations.dto';
import { PrivacyPolicyRepository } from '../repositories/privacy-policy.repository';
import { TermsRepository } from '../repositories/terms.repository';

@Injectable()
export class TermsAndPoliciesService {
  constructor(
    private readonly termsRepository: TermsRepository,
    private readonly privacyPolicyRepository: PrivacyPolicyRepository,
    private readonly i18n: I18nService,
  ) {}

  public async getLatestTermsWithTranslations(): Promise<TermsWithTranslationsDto> {
    const terms = await this.termsRepository.getLatestTermsWithTranslations();
    if (!terms) throw new NotFoundException(this.i18n.t('messages.TermsAndPolicies.errors.termsNotFound'));
    return terms;
  }

  public async getLatestPrivacyPolicyWithTranslations(): Promise<PrivacyPolicyWithTranslationsDto> {
    const policy = await this.privacyPolicyRepository.getLatestPrivacyPolicyWithTranslations();
    if (!policy) throw new NotFoundException(this.i18n.t('messages.TermsAndPolicies.errors.privacyPolicyNotFound'));
    return policy;
  }
}
