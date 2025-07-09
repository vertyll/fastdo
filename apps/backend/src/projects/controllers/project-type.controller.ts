import { Controller, Get } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../common/decorators/api-wrapped-response.decorator';
import { LanguageCodeEnum } from '../../core/language/enums/language-code.enum';
import { ProjectTypeDto } from '../dtos/project-type.dto';
import { ProjectTypeService } from '../services/project-type.service';

@ApiTags('project-types')
@Controller('project-types')
export class ProjectTypeController {
  constructor(private readonly projectTypeService: ProjectTypeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all project types' })
  @ApiHeader({ name: 'x-lang', enum: LanguageCodeEnum, required: false })
  @ApiQuery({ name: 'lang', enum: LanguageCodeEnum, required: false })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return all project types.',
    type: ProjectTypeDto,
    isArray: true,
  })
  public getAll(): Promise<{ id: number; translations: { lang: string; name: string; description?: string; }[]; }[]> {
    return this.projectTypeService.findAll();
  }
}
