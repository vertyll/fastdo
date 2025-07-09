import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../common/decorators/api-wrapped-response.decorator';
import { LanguageCodeEnum } from '../../core/language/enums/language-code.enum';
import { CreateProjectTypeDto } from '../dtos/create-project-type.dto';
import { ProjectTypeDto } from '../dtos/project-type.dto';
import { UpdateProjectTypeDto } from '../dtos/update-project-type.dto';
import { ProjectType } from '../entities/project-type.entity';
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
  public getAll(): Promise<{ id: number; translations: { lang: string; name: string; description?: string }[] }[]> {
    return this.projectTypeService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project type' })
  @ApiBody({ type: CreateProjectTypeDto })
  @ApiWrappedResponse({
    status: 201,
    description: 'The project type has been successfully created.',
    type: ProjectType,
  })
  public create(@Body() createProjectTypeDto: CreateProjectTypeDto): Promise<ProjectType> {
    return this.projectTypeService.create(createProjectTypeDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project type by id' })
  @ApiWrappedResponse({ status: 200, description: 'Return the project type.', type: ProjectType })
  public findOne(@Param('id') id: string): Promise<ProjectType> {
    return this.projectTypeService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project type' })
  @ApiBody({ type: UpdateProjectTypeDto })
  @ApiWrappedResponse({
    status: 200,
    description: 'The project type has been successfully updated.',
    type: ProjectType,
  })
  public update(
    @Param('id') id: string,
    @Body() updateProjectTypeDto: UpdateProjectTypeDto,
  ): Promise<ProjectType> {
    return this.projectTypeService.update(+id, updateProjectTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a project type' })
  @ApiWrappedResponse({
    status: 204,
    description: 'The project type has been successfully removed.',
  })
  public async remove(@Param('id') id: string): Promise<void> {
    await this.projectTypeService.remove(+id);
  }
}
