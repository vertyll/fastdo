import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../common/decorators/api-wrapped-response.decorator';
import { TaskPriorityResponseDto } from '../dtos/task-priority-response.dto';
import { TaskPriorityService } from '../services/task-priority.service';

@Controller('task-priorities')
@ApiTags('task-priorities')
export class TaskPriorityController {
  constructor(private readonly taskPriorityService: TaskPriorityService) {}

  @Get()
  @ApiOperation({ summary: 'Get all task priorities' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return all task priorities with translations.',
    type: TaskPriorityResponseDto,
    isPaginated: false,
  })
  async findAll(): Promise<TaskPriorityResponseDto[]> {
    return this.taskPriorityService.findAll();
  }
}
