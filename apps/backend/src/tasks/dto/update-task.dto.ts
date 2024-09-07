import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  done?: boolean;

  @ApiProperty({ required: false })
  urgent?: boolean;

  @ApiProperty({ required: false })
  projectId?: number;
}
