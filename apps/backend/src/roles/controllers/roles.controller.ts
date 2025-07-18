import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RoleDto } from '../dtos/role.dto';
import { RolesService } from '../services/roles.service';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active roles with translations' })
  @ApiResponse({ status: 200, type: [RoleDto] })
  async getAllRoles(): Promise<RoleDto[]> {
    return this.rolesService.getAllRoles();
  }
}
