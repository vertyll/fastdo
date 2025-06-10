import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../common/decorators/api-wrapped-response.decorator';
import { ApiPaginatedResponse } from '../common/types/api-responses.interface';
import { CreateProjectDto } from './dtos/create-project.dto';
import { GetAllProjectsSearchParams } from './dtos/get-all-projects-search-params.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { Project } from './entities/project.entity';
import { ProjectManagementService } from './projects-managment.service';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectManagementService: ProjectManagementService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiWrappedResponse({ status: 200, description: 'Return all projects.', type: Project, isPaginated: true })
  public getAll(
    @Query() query: GetAllProjectsSearchParams,
  ): Promise<ApiPaginatedResponse<Project>> {
    return this.projectsService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiWrappedResponse({
    status: 201,
    description: 'The project has been successfully created.',
    type: Project,
  })
  public create(
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    return this.projectsService.create(createProjectDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by id' })
  @ApiWrappedResponse({ status: 200, description: 'Return the project.', type: Project })
  public findOne(@Param('id') id: string): Promise<Project> {
    return this.projectsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiWrappedResponse({
    status: 200,
    description: 'The project has been successfully updated.',
    type: Project,
  })
  public update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a project' })
  @ApiWrappedResponse({
    status: 204,
    description: 'The project has been successfully removed.',
  })
  public async remove(@Param('id') id: string): Promise<void> {
    await this.projectManagementService.removeProjectWithTasks(+id);
  }
}
