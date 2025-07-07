import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

export class CreateTaskDto {
  @ApiProperty({ description: 'Task description' })
  @IsString()
  @MinLength(3, {
    message: i18nValidationMessage<I18nTranslations>('messages.Validation.minLength', { length: 3 }),
  })
  description: string;

  @ApiProperty({ required: false, description: 'Additional description' })
  @IsOptional()
  @IsString()
  additionalDescription?: string;

  @ApiProperty({ description: 'Project ID - required for all tasks' })
  @IsNumber()
  projectId: number;

  @ApiProperty({ required: false, description: 'Priority ID' })
  @IsOptional()
  @IsNumber()
  priorityId?: number;

  @ApiProperty({ required: false, description: 'Array of category IDs from project', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  categoryIds?: number[];

  @ApiProperty({ required: false, description: 'Status ID from project' })
  @IsOptional()
  @IsNumber()
  statusId?: number;

  @ApiProperty({
    required: false,
    description: 'Price estimation (0-100, where 100 = 1 hour)',
    minimum: 0,
    maximum: 10000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  priceEstimation?: number;

  @ApiProperty({ required: false, description: 'Worked time (0-100, where 100 = 1 hour)', minimum: 0, maximum: 10000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  workedTime?: number;

  @ApiProperty({ required: false, description: 'Required role ID to access this task' })
  @IsOptional()
  @IsNumber()
  accessRoleId?: number;

  @ApiProperty({ required: false, description: 'Array of user IDs to assign task to', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  assignedUserIds?: number[];

  @ApiProperty({ required: false, description: 'Attachment file IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentIds?: string[];
}
