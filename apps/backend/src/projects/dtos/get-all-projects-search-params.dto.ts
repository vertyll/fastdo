import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { ArrayTransform } from 'src/common/decorators/array-transform.decorator';

export class GetAllProjectsSearchParamsDto {
  @ApiProperty({ required: false, description: 'Search query' })
  @IsOptional()
  @IsString()
  public readonly q?: string;

  @ApiProperty({
    required: false,
    enum: ['dateCreation', 'dateModification', 'name'],
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsString()
  @IsIn(['dateCreation', 'dateModification', 'name'])
  public readonly sortBy?: string;

  @ApiProperty({
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  public readonly orderBy?: 'asc' | 'desc';

  @ApiProperty({
    required: false,
    description: 'Filter projects created from this date',
  })
  @IsOptional()
  @IsString()
  public readonly createdFrom?: string;

  @ApiProperty({
    required: false,
    description: 'Filter projects created to this date',
  })
  @IsOptional()
  @IsString()
  public readonly createdTo?: string;

  @ApiProperty({
    required: false,
    description: 'Filter projects updated from this date',
  })
  @IsOptional()
  @IsString()
  public readonly updatedFrom?: string;

  @ApiProperty({
    required: false,
    description: 'Filter projects updated to this date',
  })
  @IsOptional()
  @IsString()
  public readonly updatedTo?: string;

  @ApiProperty({
    required: false,
    type: [Number],
    description: 'Filter by project type IDs (multiselect)',
  })
  @IsOptional()
  @ArrayTransform()
  public readonly typeIds?: number[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  public readonly page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  public readonly pageSize?: number;
}
