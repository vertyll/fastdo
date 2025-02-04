import { Body, Controller, Get, Post, Query, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { ClsService } from 'nestjs-cls';
import { I18nService } from 'nestjs-i18n';
import { ApiWrappedResponse } from '../common/decorators/api-wrapped-response.decorator';
import { Public } from '../common/decorators/public.decorator';
import { JwtRefreshAuthGuard } from '../common/guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { CustomClsStore } from '../core/config/types/app.config.type';
import { I18nTranslations } from '../generated/i18n/i18n.generated';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly cls: ClsService<CustomClsStore>,
    private readonly i18n: I18nService<I18nTranslations>,
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
  public async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
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
  public async register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh-token')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Access token has been refreshed successfully.',
    type: LoginResponseDto,
  })
  public async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<Pick<LoginResponseDto, 'accessToken'>> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  @ApiWrappedResponse({
    status: 200,
    description: 'User has been successfully logged out.',
  })
  public async logout(): Promise<void> {
    const user = this.cls.get('user');
    if (!user || !user.userId) throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.unauthorized'));
    return this.authService.logout(user.userId);
  }

  @Public()
  @Get('confirm-email')
  @ApiOperation({ summary: 'Confirm user email' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Email has been confirmed successfully.',
  })
  public async confirmEmail(
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
  public async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Password has been reset successfully.',
  })
  public async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    await this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Get('confirm-email-change')
  @ApiOperation({ summary: 'Confirm email change' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Email has been changed successfully.',
  })
  public async confirmEmailChange(
    @Query('token') token: string,
    @Res() res: FastifyReply,
  ): Promise<void> {
    await this.authService.confirmEmailChange(token);

    const frontendUrl = this.configService.get<string>('app.frontend.url');
    return res.redirect(`${frontendUrl}/login?emailChanged=true`, 302);
  }
}
