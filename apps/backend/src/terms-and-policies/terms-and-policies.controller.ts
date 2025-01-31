import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../common/decorators/api-wrapped-response.decorator';
import { Public } from '../common/decorators/public.decorator';
import { PrivacyPolicy } from './entities/privacy-policy.entity';
import { Terms } from './entities/terms.entity';
import { TermsAndPoliciesService } from './terms-and-policies.service';

@ApiTags('terms-and-policies')
@Controller('terms-and-policies')
export class TermsAndPoliciesController {
  constructor(
    private readonly service: TermsAndPoliciesService,
  ) {}

  @Public()
  @Get('terms')
  @ApiOperation({ summary: 'Get latest terms' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Latest terms document',
    type: Terms,
  })
  getTerms(): Promise<Terms> {
    return this.service.getLatestTerms();
  }

  @Public()
  @Get('privacy-policy')
  @ApiOperation({ summary: 'Get latest privacy policy' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Latest privacy policy document',
    type: PrivacyPolicy,
  })
  getPrivacyPolicy(): Promise<PrivacyPolicy> {
    return this.service.getLatestPrivacyPolicy();
  }
}
