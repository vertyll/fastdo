import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { ArrayTransform } from 'src/common/decorators/array-transform.decorator';
import { OrderByEnum } from '../../common/enums/order-by.enum';
import { TaskSortByEnum } from '../enums/task-sort-by.enum';

export class GetAllTasksSearchParamsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    required: false,
    type: [Number],
    description: 'Filter by task priority IDs (multiselect)',
  })
  @IsOptional()
  @ArrayTransform()
  priorityIds: number[];

  @ApiProperty({
    required: false,
    type: [Number],
    description: 'Filter by task category IDs (multiselect)',
  })
  @IsOptional()
  @ArrayTransform()
  categoryIds: number[];

  @ApiProperty({
    required: false,
    type: [Number],
    description: 'Filter by task status IDs (multiselect)',
  })
  @IsOptional()
  @ArrayTransform()
  statusIds: number[];

  @ApiProperty({
    required: false,
    type: [Number],
    description: 'Filter by assigned user IDs (multiselect)',
  })
  @IsOptional()
  @ArrayTransform()
  assignedUserIds: number[];

  @ApiProperty({
    required: false,
    enum: TaskSortByEnum,
    enumName: 'TaskSortByEnum',
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(TaskSortByEnum))
  sortBy?: TaskSortByEnum;

  @ApiProperty({
    required: false,
    enum: OrderByEnum,
    enumName: 'OrderByEnum',
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(OrderByEnum))
  orderBy?: OrderByEnum;

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
