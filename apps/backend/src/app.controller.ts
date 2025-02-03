import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiWrappedResponse } from './common/decorators/api-wrapped-response.decorator';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get hello' })
  @ApiWrappedResponse({ status: 200, description: 'Return hello.', type: String })
  public getHello(): string {
    return this.appService.getHello();
  }
}
