import { Body, Controller, Delete, Get, Headers, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../common/decorators/api-wrapped-response.decorator';
import { LanguageCodeEnum } from '../../core/language/enums/language-code.enum';
import { CreateProjectStatusDto } from '../dtos/create-project-status.dto';
import { ProjectStatusDto } from '../dtos/project-status.dto';
import { UpdateProjectStatusDto } from '../dtos/update-project-status.dto';
import { ProjectStatus } from '../entities/project-status.entity';
import { ProjectStatusService } from '../services/project-status.service';

@ApiTags('project-statuses')
@Controller('projects/:projectId/statuses')
export class ProjectStatusController {
  constructor(private readonly projectStatusService: ProjectStatusService) {}

  @Get()
  @ApiOperation({ summary: 'Get all statuses for a project' })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiHeader({ name: 'x-lang', enum: LanguageCodeEnum, required: false })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return all statuses for the project with translated names.',
    type: [ProjectStatusDto],
  })
  public async getProjectStatuses(
    @Param('projectId') projectId: string,
    @Headers('x-lang') headerLang?: LanguageCodeEnum,
  ): Promise<ProjectStatusDto[]> {
    const languageCode = headerLang || LanguageCodeEnum.POLISH;
    return this.projectStatusService.findByProjectId(+projectId, languageCode);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new status for a project' })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiBody({ type: CreateProjectStatusDto })
  @ApiWrappedResponse({
    status: 201,
    description: 'The status has been successfully created.',
    type: ProjectStatus,
  })
  public async createStatus(
    @Param('projectId') projectId: string,
    @Body() createStatusDto: CreateProjectStatusDto,
  ): Promise<ProjectStatus> {
    createStatusDto.projectId = +projectId;
    return this.projectStatusService.create(createStatusDto);
  }

  @Put(':statusId')
  @ApiOperation({ summary: 'Update a status' })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiParam({ name: 'statusId', type: 'number' })
  @ApiBody({ type: UpdateProjectStatusDto })
  @ApiWrappedResponse({
    status: 200,
    description: 'The status has been successfully updated.',
    type: ProjectStatus,
  })
  public async updateStatus(
    @Param('projectId') projectId: string,
    @Param('statusId') statusId: string,
    @Body() updateStatusDto: UpdateProjectStatusDto,
  ): Promise<ProjectStatus> {
    return this.projectStatusService.update(+statusId, updateStatusDto);
  }

  @Delete(':statusId')
  @ApiOperation({ summary: 'Delete a status' })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiParam({ name: 'statusId', type: 'number' })
  @ApiWrappedResponse({
    status: 204,
    description: 'The status has been successfully deleted.',
  })
  public async deleteStatus(
    @Param('projectId') projectId: string,
    @Param('statusId') statusId: string,
  ): Promise<void> {
    await this.projectStatusService.remove(+statusId);
  }
}
