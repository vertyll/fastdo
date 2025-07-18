import { ApiPaginatedResponse } from 'src/common/types/api-responses.interface';
import { CreateTaskCommentDto } from '../dtos/create-task-comment.dto';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { GetAllTasksSearchParamsDto } from '../dtos/get-all-tasks-search-params.dto';
import { TaskResponseDto } from '../dtos/task-response.dto';
import { UpdateTaskCommentDto } from '../dtos/update-task-comment.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { TaskComment } from '../entities/task-comment.entity';
import { Task } from '../entities/task.entity';

export interface ITasksService {
  create(createTaskDto: CreateTaskDto): Promise<Task>;
  findAll(params: GetAllTasksSearchParamsDto): Promise<ApiPaginatedResponse<TaskResponseDto>>;
  findAllByProjectId(
    projectId: number,
    params: GetAllTasksSearchParamsDto,
  ): Promise<ApiPaginatedResponse<TaskResponseDto>>;
  findOne(id: number): Promise<TaskResponseDto>;
  update(id: number, updateTaskDto: UpdateTaskDto): Promise<TaskResponseDto>;
  remove(id: number): Promise<void>;
  batchDelete(taskIds: number[]): Promise<void>;
  removeByProjectId(projectId: number): Promise<void>;
  createComment(taskId: number, createCommentDto: CreateTaskCommentDto): Promise<TaskComment>;
  removeComment(commentId: number): Promise<void>;
  updateComment(commentId: number, updateCommentDto: UpdateTaskCommentDto): Promise<TaskComment>;
}
