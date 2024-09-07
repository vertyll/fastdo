import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetAllTasksSearchParams {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ required: false, enum: ['createdAt', 'updatedAt', 'name'] })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'updatedAt', 'name'])
  sortBy?: string;

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  orderBy?: 'asc' | 'desc';

  @ApiProperty({ required: false, enum: ['true', 'false', ''] })
  @IsOptional()
  @IsString()
  @IsIn(['true', 'false', ''])
  done_like?: 'true' | 'false' | '';

  @ApiProperty({ required: false, enum: ['true', ''] })
  @IsOptional()
  @IsString()
  @IsIn(['true', ''])
  urgent_like?: 'true' | '';

  @ApiProperty({
    required: false,
    description: 'Filter tasks created from this date',
  })
  @IsOptional()
  @IsString()
  createdFrom?: string;

  @ApiProperty({
    required: false,
    description: 'Filter tasks created to this date',
  })
  @IsOptional()
  @IsString()
  createdTo?: string;

  @ApiProperty({
    required: false,
    description: 'Filter tasks updated from this date',
  })
  @IsOptional()
  @IsString()
  updatedFrom?: string;

  @ApiProperty({
    required: false,
    description: 'Filter tasks updated to this date',
  })
  @IsOptional()
  @IsString()
  updatedTo?: string;
}
