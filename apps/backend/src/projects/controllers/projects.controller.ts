import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectRolePermissions } from 'src/common/decorators/project-role-permissions.decorator';
import { ProjectRolePermissionsGuard } from 'src/common/guards/project-role-permissions.guard';
import { ApiWrappedResponse } from '../../common/decorators/api-wrapped-response.decorator';
import { FastifyFileInterceptor } from '../../common/interceptors/fastify-file.interceptor';
import { ApiPaginatedResponse } from '../../common/types/api-responses.interface';
import { UserDto } from '../../users/dtos/user.dto';
import { AcceptInvitationDto } from '../dtos/accept-invitation.dto';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { GetAllProjectsSearchParamsDto } from '../dtos/get-all-projects-search-params.dto';
import { ProjectDetailsResponseDto } from '../dtos/project-details-response.dto';
import { ProjectListResponseDto } from '../dtos/project-list-response.dto';
import { RejectInvitationDto } from '../dtos/reject-invitation.dto';
import { UpdateProjectDto } from '../dtos/update-project.dto';
import { Project } from '../entities/project.entity';
import { ProjectRolePermissionEnum } from '../enums/project-role-permission.enum';
import { ProjectManagementService } from '../services/projects-managment.service';
import { ProjectsService } from '../services/projects.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectManagementService: ProjectManagementService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return all projects.',
    type: ProjectListResponseDto,
    isPaginated: true,
  })
  public getAll(
    @Query() query: GetAllProjectsSearchParamsDto,
  ): Promise<ApiPaginatedResponse<ProjectListResponseDto>> {
    return this.projectsService.findAll(query);
  }

  @Post()
  @UseInterceptors(new FastifyFileInterceptor('icon', CreateProjectDto, {
    maxFileSize: 2 * 1024 * 1024, // 2MB
    maxFiles: 1,
    maxTotalSize: 2 * 1024 * 1024, // 2MB total
    multiple: false // Single file
  }))
  @ApiConsumes('multipart/form-data')
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

  @Get(':id/users')
  @ApiOperation({ summary: 'Get all users assigned to a project' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return all users assigned to the project with names.',
    type: UserDto,
    isArray: true,
  })
  public getProjectUsers(@Param('id') projectId: string): Promise<UserDto[]> {
    return this.projectsService.getProjectUsers(+projectId);
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Get a project by id with details' })
  @ApiQuery({ name: 'lang', required: false, description: 'Language code (default: pl)' })
  @ApiWrappedResponse({ status: 200, description: 'Return the project with details.', type: ProjectDetailsResponseDto })
  public findOneWithDetails(@Param('id') id: string, @Query('lang') lang?: string): Promise<ProjectDetailsResponseDto> {
    return this.projectsService.findOneWithDetails(+id, lang || 'pl');
  }

  @Patch(':id')
  @UseGuards(ProjectRolePermissionsGuard)
  @ProjectRolePermissions(ProjectRolePermissionEnum.EDIT_PROJECT, 'id')
  @UseInterceptors(new FastifyFileInterceptor('icon', UpdateProjectDto))
  @ApiConsumes('multipart/form-data')
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
  @UseGuards(ProjectRolePermissionsGuard)
  @ProjectRolePermissions(ProjectRolePermissionEnum.DELETE_PROJECT, 'id')
  @ApiOperation({ summary: 'Remove a project' })
  @ApiWrappedResponse({
    status: 204,
    description: 'The project has been successfully removed.',
  })
  public async remove(@Param('id') id: string): Promise<void> {
    await this.projectManagementService.removeProjectWithTasks(+id);
  }

  @Post('invitations/accept')
  @ApiOperation({ summary: 'Get all projects where the user is invited' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return all projects where the user is invited.',
    type: Project,
    isArray: true,
  })
  async acceptInvitation(@Body() dto: AcceptInvitationDto): Promise<void> {
    return this.projectsService.acceptInvitation(dto.invitationId);
  }

  @Post('invitations/reject')
  @ApiOperation({ summary: 'Reject a project invitation' })
  @ApiWrappedResponse({
    status: 200,
    description: 'The project invitation has been successfully rejected.',
  })
  async rejectInvitation(@Body() dto: RejectInvitationDto): Promise<void> {
    return this.projectsService.rejectInvitation(dto.invitationId);
  }
}
