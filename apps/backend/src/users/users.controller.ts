import { Body, Controller, Get, Put, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User as UserDecorator } from '../common/decorators/user.decorator';
import { FastifyFileInterceptor } from '../common/interceptors/fastify-file.interceptor';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Put('me')
  @UseInterceptors(new FastifyFileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update user profile' })
  public async updateProfile(
    @UserDecorator('id') userId: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User | null> {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  public async getCurrentUser(
    @UserDecorator('id') userId: number,
  ): Promise<User | null> {
    return this.usersService.findOne(userId);
  }
}
