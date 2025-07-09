import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationTypeEnum } from '../enums/notification-type.enum';

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationTypeEnum })
  @IsEnum(NotificationTypeEnum)
  type: NotificationTypeEnum;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  data?: any;

  @ApiProperty()
  recipientId: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean = true;
}
