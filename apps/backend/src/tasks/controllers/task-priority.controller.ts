import { Controller, Get } from '@nestjs/common';
import { TaskPriorityService } from '../services/task-priority.service';

@Controller('task-priorities')
export class TaskPriorityController {
  constructor(private readonly taskPriorityService: TaskPriorityService) {}

  @Get()
  async findAll() {
    return this.taskPriorityService.findAll();
  }
}
