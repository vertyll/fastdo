import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskPriorityRepository } from '../repositories/task-priority.repository';
import { Language } from '../../core/language/entities/language.entity';
import { Repository } from 'typeorm';
import { TaskPriorityTranslation } from '../entities/task-priority-translation.entity';

@Injectable()
export class TaskPriorityService {
  constructor(
    private readonly taskPriorityRepository: TaskPriorityRepository,
    @InjectRepository(TaskPriorityTranslation) private readonly translationRepository: Repository<TaskPriorityTranslation>,
    @InjectRepository(Language) private readonly languageRepository: Repository<Language>,
  ) {}

  public async findAllWithTranslations(): Promise<any[]> {
    const priorities = await this.taskPriorityRepository.find({
      where: { isActive: true },
      relations: ['translations', 'translations.language'],
    });
    return priorities.map(priority => ({
      id: priority.id,
      translations: (priority.translations || []).map(t => ({
        lang: t.language?.code,
        name: t.name,
        description: t.description ?? undefined,
      })),
    }));
  }
}
