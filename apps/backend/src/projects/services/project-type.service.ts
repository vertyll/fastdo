import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { CreateProjectTypeDto } from '../dtos/create-project-type.dto';
import { UpdateProjectTypeDto } from '../dtos/update-project-type.dto';
import { ProjectTypeTranslation } from '../entities/project-type-translation.entity';
import { ProjectType } from '../entities/project-type.entity';
import { ProjectTypeRepository } from '../repositories/project-type.repository';

@Injectable()
export class ProjectTypeService {
  constructor(
    private readonly projectTypeRepository: ProjectTypeRepository,
    @InjectRepository(ProjectTypeTranslation) private readonly translationRepository: Repository<
      ProjectTypeTranslation
    >,
    @InjectRepository(Language) private readonly languageRepository: Repository<Language>,
  ) {}

  public async findOne(id: number): Promise<ProjectType> {
    return this.projectTypeRepository.findOneOrFail({
      where: { id },
      relations: ['translations', 'translations.language'],
    });
  }

  public async create(createProjectTypeDto: CreateProjectTypeDto): Promise<ProjectType> {
    const projectType = this.projectTypeRepository.create({});
    const savedProjectType = await this.projectTypeRepository.save(projectType);

    for (const translationDto of createProjectTypeDto.translations) {
      const language = await this.languageRepository.findOneByOrFail({
        code: translationDto.languageCode as any,
      });

      const translation = this.translationRepository.create({
        name: translationDto.name,
        description: translationDto.description,
        projectType: savedProjectType,
        language,
      });

      await this.translationRepository.save(translation);
    }

    return this.findOne(savedProjectType.id);
  }

  public async update(id: number, updateProjectTypeDto: UpdateProjectTypeDto): Promise<ProjectType> {
    const projectType = await this.findOne(id);

    if (updateProjectTypeDto.isActive !== undefined) {
      await this.projectTypeRepository.update(id, { isActive: updateProjectTypeDto.isActive });
    }

    if (updateProjectTypeDto.translations) {
      await this.translationRepository.delete({ projectType: { id } });

      for (const translationDto of updateProjectTypeDto.translations) {
        const language = await this.languageRepository.findOneByOrFail({
          code: translationDto.languageCode as any,
        });

        const translation = this.translationRepository.create({
          name: translationDto.name,
          description: translationDto.description,
          projectType,
          language,
        });

        await this.translationRepository.save(translation);
      }
    }

    return this.findOne(id);
  }

  public async remove(id: number): Promise<void> {
    await this.projectTypeRepository.update(id, { isActive: false });
  }

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
