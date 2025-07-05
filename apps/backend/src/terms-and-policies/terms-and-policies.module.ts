import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TermsAndPoliciesController } from './controllers/terms-and-policies.controller';
import { PrivacyPolicySectionTranslation } from './entities/privacy-policy-section-translation.entity';
import { PrivacyPolicySection } from './entities/privacy-policy-section.entity';
import { PrivacyPolicy } from './entities/privacy-policy.entity';
import { TermsSectionTranslation } from './entities/terms-section-translation.entity';
import { TermsSection } from './entities/terms-section.entity';
import { Terms } from './entities/terms.entity';
import { PrivacyPolicyRepository } from './repositories/privacy-policy.repository';
import { TermsRepository } from './repositories/terms.repository';
import { TermsAndPoliciesService } from './services/terms-and-policies.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Terms,
      TermsSection,
      TermsSectionTranslation,
      PrivacyPolicy,
      PrivacyPolicySection,
      PrivacyPolicySectionTranslation,
    ]),
  ],
  controllers: [TermsAndPoliciesController],
  providers: [TermsAndPoliciesService, TermsRepository, PrivacyPolicyRepository],
})
export class TermsAndPoliciesModule {}
