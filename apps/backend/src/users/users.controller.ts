import { Body, Controller, Get, Put, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { ApiWrappedResponse } from '../common/decorators/api-wrapped-response.decorator';
import { FastifyFileInterceptor } from '../common/interceptors/fastify-file.interceptor';
import { CustomClsStore } from '../core/config/types/app.config.type';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cls: ClsService<CustomClsStore>,
  ) {}

  @Put('me')
  @UseInterceptors(new FastifyFileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: User,
  })
  public async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User | null> {
    return this.usersService.updateProfile(updateProfileDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Current user profile',
    type: User,
  })
  public async getCurrentUser(): Promise<User | null> {
    const userId = this.cls.get('user').userId;
    return this.usersService.findOne(userId);
  }
}
