import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../common/decorators/api-wrapped-response.decorator';
import { ApiPaginatedResponse } from '../common/types/api-responses.interface';
import { CreateTaskDto } from './dtos/create-task.dto';
import { GetAllTasksSearchParams } from './dtos/get-all-tasks-search-params.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiWrappedResponse({
    status: 201,
    description: 'The task has been successfully created.',
    type: Task,
  })
  public create(
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiWrappedResponse({ status: 200, description: 'Return all tasks.', type: Task, isPaginated: true })
  public findAll(
    @Query() query: GetAllTasksSearchParams,
  ): Promise<ApiPaginatedResponse<Task>> {
    return this.tasksService.findAll(query);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all tasks for a specific project' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return all tasks for the specified project.',
    type: Task,
    isPaginated: true,
  })
  public findAllByProjectId(
    @Param('projectId') projectId: string,
    @Query() query: GetAllTasksSearchParams,
  ): Promise<ApiPaginatedResponse<Task>> {
    return this.tasksService.findAllByProjectId(+projectId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by id' })
  @ApiWrappedResponse({ status: 200, description: 'Return the task.', type: Task })
  public findOne(@Param('id') id: string): Promise<Task> {
    return this.tasksService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiWrappedResponse({
    status: 200,
    description: 'The task has been successfully updated.',
    type: Task,
  })
  public update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto): Promise<Task> {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiWrappedResponse({
    status: 200,
    description: 'The task has been successfully deleted.',
  })
  public remove(@Param('id') id: string): Promise<void> {
    return this.tasksService.remove(+id);
  }
}
