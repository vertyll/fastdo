import { ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Get, Put, UseInterceptors } from "@nestjs/common";
import { UsersService } from "./users.service";
import { FastifyFileInterceptor } from "../common/interceptors/fastify-file.interceptor";
import { User } from "./entities/user.entity";
import { UpdateProfileDto } from "./dtos/update-profile.dto";
import { User as UserDecorator } from '../common/decorators/user.decorator';

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
    async updateProfile(
        @UserDecorator('id') userId: number,
        @Body() updateProfileDto: UpdateProfileDto,
    ): Promise<User | null> {
        return this.usersService.updateProfile(userId, updateProfileDto);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    async getCurrentUser(
        @UserDecorator('id') userId: number,
    ): Promise<User | null> {
        return this.usersService.findOne(userId);
    }
}