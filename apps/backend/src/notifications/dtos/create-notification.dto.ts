import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationTypeEnum } from '../enums/notification-type.enum';

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationTypeEnum })
  @IsEnum(NotificationTypeEnum)
  public readonly type: NotificationTypeEnum;

  @ApiProperty()
  @IsString()
  public readonly title: string;

  @ApiProperty()
  @IsString()
  public readonly message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  public readonly data?: any;

  @ApiProperty()
  public readonly recipientId: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  public readonly sendEmail?: boolean = true;
}
