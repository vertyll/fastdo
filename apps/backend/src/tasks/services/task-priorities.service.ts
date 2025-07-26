import { Injectable } from '@nestjs/common';
import { TaskPriorityResponseDto } from '../dtos/task-priority-response.dto';
import { TaskPriorityRepository } from '../repositories/task-priority.repository';

@Injectable()
export class TaskPrioritiesService {
  constructor(
    private readonly taskPriorityRepository: TaskPriorityRepository,
  ) {}

  public async findAll(): Promise<TaskPriorityResponseDto[]> {
    const priorities = await this.taskPriorityRepository.find({
      where: { isActive: true },
      relations: ['translations', 'translations.language'],
    });
    return priorities.map(priority => ({
      id: priority.id,
      code: priority.code,
      translations: (priority.translations || []).map(t => ({
        lang: t.language?.code,
        name: t.name,
        description: t.description ?? undefined,
      })),
    }));
  }
}
