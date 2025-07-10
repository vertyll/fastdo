import { Controller, Get } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../common/decorators/api-wrapped-response.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { LanguageCodeEnum } from '../../core/language/enums/language-code.enum';
import { ProjectRoleResponseDto } from '../dtos/project-role-response.dto';
import { ProjectRoleService } from '../services/project-role.service';

@ApiTags('project-roles')
@Controller('project-roles')
export class ProjectRoleController {
  constructor(private readonly projectRoleService: ProjectRoleService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all project roles' })
  @ApiHeader({ name: 'x-lang', enum: LanguageCodeEnum, required: false })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return all project roles with translated names.',
    type: ProjectRoleResponseDto,
    isArray: true,
  })
  public async findAll(): Promise<ProjectRoleResponseDto[]> {
    return this.projectRoleService.findAll();
  }
}
