import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetAllTasksSearchParams {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ required: false, enum: ['dateCreation', 'dateModification', 'name'] })
  @IsOptional()
  @IsString()
  @IsIn(['dateCreation', 'dateModification', 'name'])
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
  is_done?: 'true' | 'false' | '';

  @ApiProperty({ required: false, enum: ['true', ''] })
  @IsOptional()
  @IsString()
  @IsIn(['true', ''])
  is_urgent?: 'true' | '';

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  pageSize?: number;
}
