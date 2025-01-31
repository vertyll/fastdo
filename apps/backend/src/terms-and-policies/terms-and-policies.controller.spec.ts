import { Test, TestingModule } from '@nestjs/testing';
import { PrivacyPolicy } from './entities/privacy-policy.entity';
import { Terms } from './entities/terms.entity';
import { TermsAndPoliciesController } from './terms-and-policies.controller';
import { TermsAndPoliciesService } from './terms-and-policies.service';

describe('TermsAndPoliciesController', () => {
  let controller: TermsAndPoliciesController;
  let service: TermsAndPoliciesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TermsAndPoliciesController],
      providers: [
        {
          provide: TermsAndPoliciesService,
          useValue: {
            getLatestTerms: jest.fn(),
            getLatestPrivacyPolicy: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TermsAndPoliciesController>(TermsAndPoliciesController);
    service = module.get<TermsAndPoliciesService>(TermsAndPoliciesService);
  });

  it('should return the latest terms', async () => {
    const terms = new Terms();
    jest.spyOn(service, 'getLatestTerms').mockResolvedValue(terms);

    expect(await controller.getTerms()).toBe(terms);
  });

  it('should return the latest privacy policy', async () => {
    const policy = new PrivacyPolicy();
    jest.spyOn(service, 'getLatestPrivacyPolicy').mockResolvedValue(policy);

    expect(await controller.getPrivacyPolicy()).toBe(policy);
  });
});
