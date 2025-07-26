import { Controller, Get } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../common/decorators/api-wrapped-response.decorator';
import { LanguageCodeEnum } from '../../core/language/enums/language-code.enum';
import { ProjectTypeResponseDto } from '../dtos/project-type-response.dto';
import { ProjectTypesService } from '../services/project-types.service';

@ApiTags('project-types')
@Controller('project-types')
export class ProjectTypesController {
  constructor(private readonly projectTypeService: ProjectTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all project types' })
  @ApiHeader({ name: 'x-lang', enum: LanguageCodeEnum, required: false })
  @ApiQuery({ name: 'lang', enum: LanguageCodeEnum, required: false })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return all project types.',
    type: ProjectTypeResponseDto,
    isArray: true,
  })
  public getAll(): Promise<ProjectTypeResponseDto[]> {
    return this.projectTypeService.findAll();
  }
}
