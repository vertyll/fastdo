import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../common/decorators/api-wrapped-response.decorator';
import { TaskPriorityResponseDto } from '../dtos/task-priority-response.dto';
import { TaskPrioritiesService } from '../services/task-priorities.service';

@Controller('task-priorities')
@ApiTags('task-priorities')
export class TaskPrioritiesController {
  constructor(private readonly taskPriorityService: TaskPrioritiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all task priorities' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return all task priorities with translations.',
    type: TaskPriorityResponseDto,
    isPaginated: false,
    isArray: true,
  })
  async findAll(): Promise<TaskPriorityResponseDto[]> {
    return this.taskPriorityService.findAll();
  }
}
