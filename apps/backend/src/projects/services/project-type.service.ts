import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { LanguageCodeEnum } from '../../core/language/enums/language-code.enum';
import { CreateProjectTypeDto } from '../dtos/create-project-type.dto';
import { ProjectTypeDto } from '../dtos/project-type.dto';
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

  public async findAll(
    languageCode: LanguageCodeEnum = LanguageCodeEnum.POLISH,
  ): Promise<ProjectTypeDto[]> {
    const projectTypes = await this.projectTypeRepository.find({
      where: { isActive: true },
      relations: ['translations', 'translations.language'],
    });

    return projectTypes.map(projectType => {
      const translation = projectType.translations.find(
        t => t.language.code === languageCode,
      ) || projectType.translations.find(
        t => t.language.isDefault,
      ) || projectType.translations[0];

      return {
        id: projectType.id,
        name: translation?.name || '',
        description: translation?.description || undefined,
      };
    });
  }
}
