import { Injectable } from "@nestjs/common";
import { Project } from "src/projects/entities/project.entity";
import { CreateTaskDto } from "./dto/create-task.dto";
import { GetAllTasksSearchParams } from "./dto/get-all-tasks-search-params.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { Task } from "./entities/task.entity";
import { TaskRepository } from "./repositories/task.repository";

@Injectable()
export class TasksService {
  constructor(private taskRepository: TaskRepository) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create(createTaskDto);
    if (createTaskDto.projectId) {
      task.project = { id: createTaskDto.projectId } as Project;
    }
    return this.taskRepository.save(task);
  }

  async findAll(params: GetAllTasksSearchParams): Promise<Task[]> {
    return this.taskRepository.findAllWithParams(params);
  }

  async findAllByProjectId(
    projectId: number,
    params: GetAllTasksSearchParams
  ): Promise<Task[]> {
    return this.taskRepository.findAllWithParams(params, projectId);
  }

  findOne(id: number): Promise<Task> {
    return this.taskRepository.findOneOrFail({ where: { id } });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    await this.taskRepository.update(id, {
      ...updateTaskDto,
      dateModification: new Date(),
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.taskRepository.delete(id);
  }

  async removeByProjectId(projectId: number): Promise<void> {
    await this.taskRepository.delete({ project: { id: projectId } });
  }
}
