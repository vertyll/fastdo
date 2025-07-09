import { Injectable } from '@nestjs/common';
import { ProjectTypeRepository } from '../repositories/project-type.repository';

@Injectable()
export class ProjectTypeService {
  constructor(
    private readonly projectTypeRepository: ProjectTypeRepository,
  ) {}

  public async findAll(): Promise<
    { id: number; translations: { lang: string; name: string; description?: string; }[]; }[]
  > {
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
