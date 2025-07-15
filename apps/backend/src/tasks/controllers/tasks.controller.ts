import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../common/decorators/api-wrapped-response.decorator';
import { FastifyFileInterceptor } from '../../common/interceptors/fastify-file.interceptor';
import { ApiPaginatedResponse } from '../../common/types/api-responses.interface';
import { CreateTaskCommentDto } from '../dtos/create-task-comment.dto';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { GetAllTasksSearchParamsDto } from '../dtos/get-all-tasks-search-params.dto';
import { TaskResponseDto } from '../dtos/task-response.dto';
import { UpdateTaskCommentDto } from '../dtos/update-task-comment.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { TaskComment } from '../entities/task-comment.entity';
import { Task } from '../entities/task.entity';
import { TasksService } from '../services/tasks.service';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  @Post()
  @UseInterceptors(new FastifyFileInterceptor('attachments', CreateTaskDto, {
    maxFileSize: 10 * 1024 * 1024, // 10MB per file
    maxFiles: 5, // max 5 files per task
    maxTotalSize: 50 * 1024 * 1024 // 50MB total
  }))
  @ApiConsumes('multipart/form-data')
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
  @ApiWrappedResponse({
    status: 200,
    description: 'Return all tasks.',
    type: TaskResponseDto,
    isPaginated: true,
  })
  public findAll(
    @Query() query: GetAllTasksSearchParamsDto,
  ): Promise<ApiPaginatedResponse<TaskResponseDto>> {
    return this.tasksService.findAll(query);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all tasks for a specific project' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return all tasks for the specified project.',
    type: TaskResponseDto,
    isPaginated: true,
  })
  public findAllByProjectId(
    @Param('projectId') projectId: string,
    @Query() query: GetAllTasksSearchParamsDto,
  ): Promise<ApiPaginatedResponse<TaskResponseDto>> {
    return this.tasksService.findAllByProjectId(+projectId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by id' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return the task.',
    type: TaskResponseDto,
  })
  public findOne(@Param('id') id: string): Promise<TaskResponseDto> {
    return this.tasksService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(new FastifyFileInterceptor('attachments', UpdateTaskDto, {
    maxFileSize: 10 * 1024 * 1024, // 10MB per file
    maxFiles: 5, // max 5 files per task
    maxTotalSize: 50 * 1024 * 1024 // 50MB total
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a task' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiWrappedResponse({
    status: 200,
    description: 'The task has been successfully updated.',
    type: TaskResponseDto,
  })
  public update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto): Promise<TaskResponseDto> {
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

  @Post('batch-delete')
  @ApiOperation({ summary: 'Delete multiple tasks' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        taskIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of task IDs to delete',
        },
      },
      required: ['taskIds'],
    },
  })
  @ApiWrappedResponse({
    status: 200,
    description: 'The tasks have been successfully deleted.',
  })
  public batchDelete(@Body() body: { taskIds: number[]; }): Promise<void> {
    return this.tasksService.batchDelete(body.taskIds);
  }

  @Post(':id/comments')
  @UseInterceptors(new FastifyFileInterceptor('attachments', CreateTaskCommentDto, {
    maxFileSize: 5 * 1024 * 1024, // 5MB per file for comments
    maxFiles: 3, // max 3 files per comment
    maxTotalSize: 15 * 1024 * 1024 // 15MB total
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a comment for a task' })
  @ApiBody({ type: CreateTaskCommentDto })
  @ApiWrappedResponse({
    status: 201,
    description: 'The comment has been successfully created.',
    type: TaskComment,
  })
  public createComment(
    @Param('id') taskId: string,
    @Body() createCommentDto: CreateTaskCommentDto,
  ): Promise<TaskComment> {
    return this.tasksService.createComment(+taskId, createCommentDto);
  }

  @Delete('comments/:commentId')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiWrappedResponse({
    status: 200,
    description: 'The comment has been successfully deleted.',
  })
  public removeComment(@Param('commentId') commentId: string): Promise<void> {
    return this.tasksService.removeComment(+commentId);
  }

  @Put('comments/:commentId')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiBody({ type: UpdateTaskCommentDto })
  @ApiWrappedResponse({
    status: 200,
    description: 'The comment has been successfully updated.',
    type: TaskComment,
  })
  public updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateTaskCommentDto,
  ): Promise<TaskComment> {
    return this.tasksService.updateComment(+commentId, updateCommentDto);
  }
}
