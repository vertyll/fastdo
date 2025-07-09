import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from 'src/common/decorators/api-wrapped-response.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PrivacyPolicyWithTranslationsDto } from '../dtos/privacy-policy-with-translations.dto';
import { TermsWithTranslationsDto } from '../dtos/terms-with-translations.dto';
import { TermsAndPoliciesService } from '../services/terms-and-policies.service';

@ApiTags('terms-and-policies')
@Controller('terms-and-policies')
export class TermsAndPoliciesController {
  constructor(
    private readonly service: TermsAndPoliciesService,
  ) {}

  @Public()
  @Get('terms')
  @ApiOperation({ summary: 'Get latest terms with all translations' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Latest terms document with all translations',
    type: TermsWithTranslationsDto,
  })
  public getTermsWithTranslations(): Promise<TermsWithTranslationsDto> {
    return this.service.getLatestTermsWithTranslations();
  }

  @Public()
  @Get('privacy-policy')
  @ApiOperation({ summary: 'Get latest privacy policy with all translations' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Latest privacy policy document with all translations',
    type: PrivacyPolicyWithTranslationsDto,
  })
  public getPrivacyPolicyWithTranslations(): Promise<PrivacyPolicyWithTranslationsDto> {
    return this.service.getLatestPrivacyPolicyWithTranslations();
  }
}
