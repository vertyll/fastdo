import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from 'src/common/decorators/api-wrapped-response.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PrivacyPolicyDto } from '../dtos/privacy-policy.dto';
import { TermsDto } from '../dtos/terms.dto';
import { TermsAndPoliciesService } from '../services/terms-and-policies.service';

@ApiTags('terms-and-policies')
@Controller('terms-and-policies')
export class TermsAndPoliciesController {
  constructor(private readonly service: TermsAndPoliciesService) {}

  @Public()
  @Get('terms')
  @ApiOperation({ summary: 'Get latest terms with all translations' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Latest terms document with all translations',
    type: TermsDto,
  })
  public getTerms(): Promise<TermsDto> {
    return this.service.getLatestTerms();
  }

  @Public()
  @Get('privacy-policy')
  @ApiOperation({ summary: 'Get latest privacy policy with all translations' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Latest privacy policy document with all translations',
    type: PrivacyPolicyDto,
  })
  public getPrivacyPolicy(): Promise<PrivacyPolicyDto> {
    return this.service.getLatestPrivacyPolicy();
  }
}
