import { MultipartFile } from '@fastify/multipart';
import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator';
import { IsFile } from '../../common/decorators/is-file.decorator';
import {
  InheritsMultipartMetadata,
  MultipartArray,
  MultipartBoolean,
  MultipartJSON,
} from '../../common/decorators/multipart-transform.decorator';
import { CreateProjectDto } from './create-project.dto';
import { UserWithRoleDto } from './user-with-role.dto';

@InheritsMultipartMetadata(CreateProjectDto)
export class UpdateProjectDto extends PartialType(CreateProjectDto) {
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

  @ApiProperty({ required: false })
  @IsOptional()
  @MultipartBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  isActive?: boolean;

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
    description: 'Array of user emails to invite to this project (legacy)',
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
