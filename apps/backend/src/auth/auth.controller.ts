import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { ApiWrappedResponse } from '../common/decorators/api-wrapped-response.decorator';
import { Public } from '../common/decorators/public.decorator';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Remove a project' })
  @ApiWrappedResponse({
    status: 200,
    description: 'The user has been successfully logged in.',
    type: LoginResponseDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiWrappedResponse({
    status: 201,
    description: 'The user has been successfully registered.',
    type: User,
  })
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Get('confirm-email')
  @ApiOperation({ summary: 'Confirm user email' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Email has been confirmed successfully.',
  })
  async confirmEmail(
    @Query('token') token: string,
    @Res() res: FastifyReply,
  ): Promise<void> {
    await this.authService.confirmEmail(token);

    const frontendUrl = this.configService.get<string>('app.frontend.url');
    return res.redirect(`${frontendUrl}/login?confirmed=true`, 302);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Password reset email sent successfully.',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Password has been reset successfully.',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    await this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
    @Get('confirm-email-change')
    @ApiOperation({ summary: 'Confirm email change' })
    @ApiWrappedResponse({
        status: 200,
        description: 'Email has been changed successfully.',
    })
    async confirmEmailChange(
        @Query('token') token: string,
        @Res() res: FastifyReply,
    ): Promise<void> {
        await this.authService.confirmEmailChange(token);

        const frontendUrl = this.configService.get<string>('app.frontend.url');
        return res.redirect(`${frontendUrl}/login?emailChanged=true`, 302);
    }
}
