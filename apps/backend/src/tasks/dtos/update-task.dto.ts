import { MultipartFile } from '@fastify/multipart';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsFile } from '../../common/decorators/is-file.decorator';
import { MultipartArray, MultipartNumber } from '../../common/decorators/multipart-transform.decorator';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

export class UpdateTaskDto {
  @ApiProperty({ required: false, description: 'Task description' })
  @IsOptional()
  @IsString()
  @MinLength(3, {
    message: i18nValidationMessage<I18nTranslations>('messages.Validation.minLength', { length: 3 }),
  })
  description?: string;

  @ApiProperty({ required: false, description: 'Additional description' })
  @IsOptional()
  @IsString()
  additionalDescription?: string;

  @ApiProperty({ required: false, description: 'Priority ID' })
  @IsOptional()
  @MultipartNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value !== '') {
      const num = Number(value);
      return isNaN(num) ? undefined : num;
    }
    return value;
  })
  @IsNumber()
  priorityId?: number;

  @ApiProperty({ required: false, description: 'Category ID from project (if task belongs to project)' })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ required: false, description: 'Array of category IDs from project', type: [Number] })
  @IsOptional()
  @MultipartArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  @IsNumber({}, { each: true })
  categoryIds?: number[];

  @ApiProperty({ required: false, description: 'Status ID from project (if task belongs to project)' })
  @IsOptional()
  @MultipartNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value !== '') {
      const num = Number(value);
      return isNaN(num) ? undefined : num;
    }
    return value;
  })
  @IsNumber()
  statusId?: number;

  @ApiProperty({
    required: false,
    description: 'Price estimation (0-100, where 100 = 1 hour)',
    minimum: 0,
    maximum: 10000,
  })
  @IsOptional()
  @MultipartNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value !== '') {
      const num = Number(value);
      return isNaN(num) ? undefined : num;
    }
    return value;
  })
  @IsNumber()
  @Min(0)
  @Max(10000)
  priceEstimation?: number;

  @ApiProperty({ required: false, description: 'Worked time (0-100, where 100 = 1 hour)', minimum: 0, maximum: 10000 })
  @IsOptional()
  @MultipartNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value !== '') {
      const num = Number(value);
      return isNaN(num) ? undefined : num;
    }
    return value;
  })
  @IsNumber()
  @Min(0)
  @Max(10000)
  workedTime?: number;

  @ApiProperty({ required: false, description: 'Required role ID to access this task' })
  @IsOptional()
  @MultipartNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value !== '') {
      const num = Number(value);
      return isNaN(num) ? undefined : num;
    }
    return value;
  })
  @IsNumber()
  accessRoleId?: number;

  @ApiProperty({ required: false, description: 'Array of user IDs to assign task to', type: [Number] })
  @IsOptional()
  @MultipartArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.warn('Failed to parse assignedUserIds as JSON:', error);
        return [];
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  @IsNumber({}, { each: true })
  assignedUserIds?: number[];

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
    description: 'Task attachment files',
  })
  @IsOptional()
  @MultipartArray()
  @IsFile({
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
    maxSize: 10 * 1024 * 1024, // 10MB
  })
  attachments?: MultipartFile[];

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
    },
    required: false,
    description: 'Array of attachment IDs to delete',
  })
  @IsOptional()
  @MultipartArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  @IsString({ each: true })
  attachmentsToDelete?: string[];
}
