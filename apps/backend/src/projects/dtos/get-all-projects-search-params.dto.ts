import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetAllProjectsSearchParams {
  @ApiProperty({ required: false, description: 'Search query' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    required: false,
    enum: ['dateCreation', 'dateModification', 'name'],
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsString()
  @IsIn(['dateCreation', 'dateModification', 'name'])
  sortBy?: string;

  @ApiProperty({
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  orderBy?: 'asc' | 'desc';

  @ApiProperty({
    required: false,
    description: 'Filter projects created from this date',
  })
  @IsOptional()
  @IsString()
  createdFrom?: string;

  @ApiProperty({
    required: false,
    description: 'Filter projects created to this date',
  })
  @IsOptional()
  @IsString()
  createdTo?: string;

  @ApiProperty({
    required: false,
    description: 'Filter projects updated from this date',
  })
  @IsOptional()
  @IsString()
  updatedFrom?: string;

  @ApiProperty({
    required: false,
    description: 'Filter projects updated to this date',
  })
  @IsOptional()
  @IsString()
  updatedTo?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  pageSize?: number;
}
