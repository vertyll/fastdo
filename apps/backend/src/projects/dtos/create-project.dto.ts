import { MultipartFile } from '@fastify/multipart';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsFile } from '../../common/decorators/is-file.decorator';
import {
  MultipartArray,
  MultipartBoolean,
  MultipartJSON,
  MultipartNumber,
} from '../../common/decorators/multipart-transform.decorator';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { UserWithRoleDto } from './user-with-role.dto';

export class CreateProjectDto {
  @ApiProperty({ description: 'The name of the project' })
  @IsString()
  @MinLength(3, {
    message: i18nValidationMessage<I18nTranslations>('messages.Validation.minLength', { length: 3 }),
  })
  name: string;

  @ApiProperty({
    description: 'The description of the project',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Whether the project is public',
    required: false,
    default: false,
  })
  @IsOptional()
  @MultipartBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: 'The type ID of the project', required: false })
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
  typeId?: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Icon image (JPEG or PNG, max 2MB)',
  })
  @IsOptional()
  @IsFile({
    mimeTypes: ['image/jpeg', 'image/png'],
    maxSize: 2 * 1024 * 1024, // 2MB
  })
  icon?: MultipartFile | null;

  @ApiProperty({
    description: 'Array of categories with colors to create for this project',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        color: { type: 'string' },
      },
    },
  })
  @IsOptional()
  @MultipartJSON()
  @Transform(({ value }) => {
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  categories?: Array<{ name: string; color?: string }>;

  @ApiProperty({
    description: 'Array of statuses with colors to create for this project',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        color: { type: 'string' },
      },
    },
  })
  @IsOptional()
  @MultipartJSON()
  @Transform(({ value }) => {
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  statuses?: Array<{ name: string; color?: string }>;

  @ApiProperty({
    description: 'Array of users with roles to invite to this project',
    required: false,
    type: [UserWithRoleDto],
  })
  @IsOptional()
  @MultipartJSON()
  @Transform(({ value }) => {
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  @ValidateIf((_object, value) => Array.isArray(value) && value.length > 0)
  @ValidateNested({ each: true })
  @Type(() => UserWithRoleDto)
  usersWithRoles?: UserWithRoleDto[];

  @ApiProperty({
    description: 'Array of user emails to invite to this project (legacy - use usersWithRoles instead)',
    required: false,
  })
  @IsOptional()
  @MultipartArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return [value];
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  @IsString({ each: true })
  userEmails?: string[];
}
