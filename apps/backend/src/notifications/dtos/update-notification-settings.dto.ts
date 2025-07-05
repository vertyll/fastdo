import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  appNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  projectInvitations?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  taskAssignments?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  taskComments?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  taskStatusChanges?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  projectUpdates?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  systemNotifications?: boolean;
}
