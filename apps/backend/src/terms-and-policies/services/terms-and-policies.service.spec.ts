import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { PrivacyPolicy } from '../entities/privacy-policy.entity';
import { Terms } from '../entities/terms.entity';
import { PrivacyPolicyRepository } from '../repositories/privacy-policy.repository';
import { TermsRepository } from '../repositories/terms.repository';
import { TermsAndPoliciesService } from './terms-and-policies.service';

describe('TermsAndPoliciesService', () => {
  let service: TermsAndPoliciesService;
  let termsRepository: TermsRepository;
  let privacyPolicyRepository: PrivacyPolicyRepository;
  let i18nService: I18nService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TermsAndPoliciesService,
        {
          provide: TermsRepository,
          useValue: {
            getLatestTerms: jest.fn(),
          },
        },
        {
          provide: PrivacyPolicyRepository,
          useValue: {
            getLatestPrivacyPolicy: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockReturnValue(''),
          },
        },
      ],
    }).compile();

    service = module.get<TermsAndPoliciesService>(TermsAndPoliciesService);
    termsRepository = module.get<TermsRepository>(TermsRepository);
    privacyPolicyRepository = module.get<PrivacyPolicyRepository>(PrivacyPolicyRepository);
    i18nService = module.get<I18nService>(I18nService);
  });

  it('should return the latest terms', async () => {
    const terms = new Terms();
    jest.spyOn(termsRepository, 'getLatestTerms').mockResolvedValue(terms);

    expect(await service.getLatestTerms()).toBe(terms);
  });

  it('should throw NotFoundException if terms not found', async () => {
    jest.spyOn(termsRepository, 'getLatestTerms').mockResolvedValue(null);
    jest.spyOn(i18nService, 't').mockReturnValue('Terms not found');

    await expect(service.getLatestTerms()).rejects.toThrow(NotFoundException);
    await expect(service.getLatestTerms()).rejects.toThrow('Terms not found');
  });

  it('should return the latest privacy policy', async () => {
    const policy = new PrivacyPolicy();
    jest.spyOn(privacyPolicyRepository, 'getLatestPrivacyPolicy').mockResolvedValue(policy);

    expect(await service.getLatestPrivacyPolicy()).toBe(policy);
  });

  it('should throw NotFoundException if privacy policy not found', async () => {
    jest.spyOn(privacyPolicyRepository, 'getLatestPrivacyPolicy').mockResolvedValue(null);
    jest.spyOn(i18nService, 't').mockReturnValue('Privacy policy not found');

    await expect(service.getLatestPrivacyPolicy()).rejects.toThrow(NotFoundException);
    await expect(service.getLatestPrivacyPolicy()).rejects.toThrow('Privacy policy not found');
  });
});
