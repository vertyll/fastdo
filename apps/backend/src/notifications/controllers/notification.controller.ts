import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { ApiWrappedResponse } from '../../common/decorators/api-wrapped-response.decorator';
import { CustomClsStore } from '../../core/config/types/app.config.type';
import { CreateNotificationDto } from '../dtos/create-notification.dto';
import { UpdateNotificationSettingsDto } from '../dtos/update-notification-settings.dto';
import { NotificationSettings } from '../entities/notification-settings.entity';
import { Notification } from '../entities/notification.entity';
import { NotificationService } from '../services/notification.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly cls: ClsService<CustomClsStore>,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiWrappedResponse({
    status: 201,
    description: 'The notification has been successfully created.',
    type: Notification,
  })
  public create(@Body() createNotificationDto: CreateNotificationDto): Promise<Notification | null> {
    return this.notificationService.createNotification(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return all notifications.',
    type: Notification,
    isArray: true,
  })
  public findAll(): Promise<Notification[]> {
    // This endpoint would typically require pagination and filtering
    // For now, we'll return an empty array or implement basic functionality
    return Promise.resolve([]);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification for current user' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Notification deleted.',
  })
  public deleteMyNotification(@Param('id') id: string): Promise<void> {
    const userId = this.cls.get('user').userId;
    return this.notificationService.deleteNotification(userId, +id);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get notifications for current user' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return current user notifications.',
    type: Notification,
    isArray: true,
  })
  public getMyNotifications(@Query('limit') limit?: string): Promise<Notification[]> {
    const userId = this.cls.get('user').userId;
    return this.notificationService.getUserNotifications(userId, limit ? +limit : 50);
  }

  @Get('me/unread-count')
  @ApiOperation({ summary: 'Get unread notifications count for current user' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return unread notifications count.',
  })
  public getMyUnreadCount(): Promise<number> {
    const userId = this.cls.get('user').userId;
    return this.notificationService.getUnreadCount(userId);
  }

  @Patch('me/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  @ApiWrappedResponse({
    status: 200,
    description: 'All notifications marked as read.',
  })
  public markAllMyAsRead(): Promise<void> {
    const userId = this.cls.get('user').userId;
    return this.notificationService.markAllAsRead(userId);
  }

  @Delete('me/clear-all')
  @ApiOperation({ summary: 'Clear all notifications for current user' })
  @ApiWrappedResponse({
    status: 200,
    description: 'All notifications cleared.',
  })
  public clearAllMyNotifications(): Promise<void> {
    const userId = this.cls.get('user').userId;
    return this.notificationService.clearAllNotifications(userId);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get notification settings for current user' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return current user notification settings.',
    type: NotificationSettings,
  })
  public getMySettings(): Promise<NotificationSettings> {
    const userId = this.cls.get('user').userId;
    return this.notificationService.getUserSettings(userId);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update notification settings for current user' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Notification settings updated.',
    type: NotificationSettings,
  })
  public updateMySettings(@Body() updateDto: UpdateNotificationSettingsDto): Promise<NotificationSettings> {
    const userId = this.cls.get('user').userId;
    return this.notificationService.updateUserSettings(userId, updateDto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read for current user' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Notification marked as read.',
  })
  public markMyAsRead(@Param('id') id: string): Promise<void> {
    const userId = this.cls.get('user').userId;
    return this.notificationService.markAsRead(+id, userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get notifications for a user' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return user notifications.',
    type: Notification,
    isArray: true,
  })
  public getUserNotifications(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ): Promise<Notification[]> {
    return this.notificationService.getUserNotifications(+userId, limit ? +limit : 50);
  }

  @Get('user/:userId/unread-count')
  @ApiOperation({ summary: 'Get unread notifications count for a user' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return unread notifications count.',
  })
  public getUnreadCount(@Param('userId') userId: string): Promise<number> {
    return this.notificationService.getUnreadCount(+userId);
  }

  @Patch(':id/read/:userId')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Notification marked as read.',
  })
  public markAsRead(@Param('id') id: string, @Param('userId') userId: string): Promise<void> {
    return this.notificationService.markAsRead(+id, +userId);
  }

  @Patch('user/:userId/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  @ApiWrappedResponse({
    status: 200,
    description: 'All notifications marked as read.',
  })
  public markAllAsRead(@Param('userId') userId: string): Promise<void> {
    return this.notificationService.markAllAsRead(+userId);
  }

  @Get('settings/:userId')
  @ApiOperation({ summary: 'Get notification settings for a user' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return user notification settings.',
    type: NotificationSettings,
  })
  public getUserSettings(@Param('userId') userId: string): Promise<NotificationSettings> {
    return this.notificationService.getUserSettings(+userId);
  }

  @Patch('settings/:userId')
  @ApiOperation({ summary: 'Update notification settings for a user' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Notification settings updated.',
    type: NotificationSettings,
  })
  public updateUserSettings(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettings> {
    return this.notificationService.updateUserSettings(+userId, updateDto);
  }
}
