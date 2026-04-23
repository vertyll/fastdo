import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  public readonly emailNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  public readonly appNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  public readonly projectInvitations?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  public readonly taskAssignments?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  public readonly taskComments?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  public readonly taskStatusChanges?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  public readonly projectUpdates?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  public readonly systemNotifications?: boolean;
}
