import { Injectable } from '@nestjs/common';
import { ProjectTypeResponseDto } from '../dtos/project-type-response.dto';
import { ProjectTypeRepository } from '../repositories/project-type.repository';

@Injectable()
export class ProjectTypesService {
  constructor(
    private readonly projectTypeRepository: ProjectTypeRepository,
  ) {}

  public async findAll(): Promise<ProjectTypeResponseDto[]> {
    const projectTypes = await this.projectTypeRepository.find({
      where: { isActive: true },
      relations: ['translations', 'translations.language'],
    });

    return projectTypes.map(type => ({
      id: type.id,
      translations: (type.translations || []).map(t => ({
        lang: t.language?.code,
        name: t.name,
        description: t.description ?? undefined,
      })),
    }));
  }
}
