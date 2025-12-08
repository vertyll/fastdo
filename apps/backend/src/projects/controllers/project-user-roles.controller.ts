import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../common/decorators/api-wrapped-response.decorator';
import { AssignProjectRoleDto, UpdateProjectRoleDto } from '../dtos/project-user-role.dto';
import { ProjectUserRole } from '../entities/project-user-role.entity';
import { ProjectUserRolesService } from '../services/project-user-roles.service';

@ApiTags('project-user-roles')
@Controller('project-user-roles')
export class ProjectUserRolesController {
  constructor(private readonly projectUserRoleService: ProjectUserRolesService) {}

  @Post()
  @ApiOperation({ summary: 'Assign a role to user in project' })
  @ApiBody({ type: AssignProjectRoleDto })
  @ApiWrappedResponse({
    status: 201,
    description: 'The role has been successfully assigned.',
    type: ProjectUserRole,
  })
  public assignRole(@Body() assignProjectRoleDto: AssignProjectRoleDto): Promise<ProjectUserRole> {
    return this.projectUserRoleService.assignRole(assignProjectRoleDto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all user roles for a project' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return all user roles for the project.',
    type: ProjectUserRole,
    isArray: true,
  })
  public getProjectRoles(@Param('projectId') projectId: string): Promise<ProjectUserRole[]> {
    return this.projectUserRoleService.getProjectRoles(+projectId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all project roles for a user' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return all project roles for the user.',
    type: ProjectUserRole,
    isArray: true,
  })
  public getUserRoles(@Param('userId') userId: string): Promise<ProjectUserRole[]> {
    return this.projectUserRoleService.getUserRoles(+userId);
  }

  @Get('project/:projectId/user/:userId')
  @ApiOperation({ summary: 'Get user role in specific project' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return user role in the project.',
  })
  public getUserRoleInProject(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ): Promise<number | null> {
    return this.projectUserRoleService.getUserRoleInProject(+projectId, +userId);
  }

  @Patch('project/:projectId/user/:userId')
  @ApiOperation({ summary: 'Update user role in project' })
  @ApiBody({ type: UpdateProjectRoleDto })
  @ApiWrappedResponse({
    status: 200,
    description: 'The role has been successfully updated.',
    type: ProjectUserRole,
  })
  public updateRole(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Body() updateProjectRoleDto: UpdateProjectRoleDto,
  ): Promise<ProjectUserRole> {
    return this.projectUserRoleService.updateRole(+projectId, +userId, updateProjectRoleDto);
  }

  @Delete('project/:projectId/user/:userId')
  @ApiOperation({ summary: 'Remove user role from project' })
  @ApiWrappedResponse({
    status: 204,
    description: 'The role has been successfully removed.',
  })
  public async removeRole(@Param('projectId') projectId: string, @Param('userId') userId: string): Promise<void> {
    await this.projectUserRoleService.removeRole(+projectId, +userId);
  }

  @Get('project/:projectId/users')
  @ApiOperation({ summary: 'Get all users assigned to project' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return all users assigned to the project.',
    type: ProjectUserRole,
    isArray: true,
  })
  public getUsersInProject(@Param('projectId') projectId: string): Promise<ProjectUserRole[]> {
    return this.projectUserRoleService.getUsersInProject(+projectId);
  }
}
