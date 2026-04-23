import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { ArrayTransform } from 'src/common/decorators/array-transform.decorator';
import { OrderByEnum } from '../../common/enums/order-by.enum';
import { TaskSortByEnum } from '../enums/task-sort-by.enum';

export class GetAllTasksSearchParamsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  public readonly q?: string;

  @ApiProperty({
    required: false,
    type: [Number],
    description: 'Filter by task priority IDs (multiselect)',
  })
  @IsOptional()
  @ArrayTransform()
  public readonly priorityIds: number[];

  @ApiProperty({
    required: false,
    type: [Number],
    description: 'Filter by task category IDs (multiselect)',
  })
  @IsOptional()
  @ArrayTransform()
  public readonly categoryIds: number[];

  @ApiProperty({
    required: false,
    type: [Number],
    description: 'Filter by task status IDs (multiselect)',
  })
  @IsOptional()
  @ArrayTransform()
  public readonly statusIds: number[];

  @ApiProperty({
    required: false,
    type: [Number],
    description: 'Filter by assigned user IDs (multiselect)',
  })
  @IsOptional()
  @ArrayTransform()
  public readonly assignedUserIds: number[];

  @ApiProperty({
    required: false,
    enum: TaskSortByEnum,
    enumName: 'TaskSortByEnum',
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(TaskSortByEnum))
  public readonly sortBy?: TaskSortByEnum;

  @ApiProperty({
    required: false,
    enum: OrderByEnum,
    enumName: 'OrderByEnum',
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(OrderByEnum))
  public readonly orderBy?: OrderByEnum;

  @ApiProperty({
    required: false,
    description: 'Filter tasks created from this date',
  })
  @IsOptional()
  @IsString()
  public readonly createdFrom?: string;

  @ApiProperty({
    required: false,
    description: 'Filter tasks created to this date',
  })
  @IsOptional()
  @IsString()
  public readonly createdTo?: string;

  @ApiProperty({
    required: false,
    description: 'Filter tasks updated from this date',
  })
  @IsOptional()
  @IsString()
  public readonly updatedFrom?: string;

  @ApiProperty({
    required: false,
    description: 'Filter tasks updated to this date',
  })
  @IsOptional()
  @IsString()
  public readonly updatedTo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  public readonly page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  public readonly pageSize?: number;
}
