import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { LanguageCodeEnum } from '../../core/language/enums/language-code.enum';
import { CreateProjectStatusDto } from '../dtos/create-project-status.dto';
import { ProjectStatusDto } from '../dtos/project-status.dto';
import { UpdateProjectStatusDto } from '../dtos/update-project-status.dto';
import { ProjectStatusTranslation } from '../entities/project-status-translation.entity';
import { ProjectStatus } from '../entities/project-status.entity';
import { ProjectStatusRepository } from '../repositories/project-status.repository';

@Injectable()
export class ProjectStatusService {
  constructor(
    private readonly projectStatusRepository: ProjectStatusRepository,
    @InjectRepository(ProjectStatusTranslation) private readonly translationRepository: Repository<
      ProjectStatusTranslation
    >,
    @InjectRepository(Language) private readonly languageRepository: Repository<Language>,
  ) {}

  public async findByProjectId(
    projectId: number,
    languageCode: LanguageCodeEnum = LanguageCodeEnum.POLISH,
  ): Promise<ProjectStatusDto[]> {
    const statuses = await this.projectStatusRepository.find({
      where: { project: { id: projectId }, isActive: true },
      relations: ['translations', 'translations.language'],
    });

    return statuses.map(status => {
      const translation = status.translations.find(t => t.language.code === languageCode)
        || status.translations[0]; // fallback to first translation

      return {
        id: status.id,
        name: translation ? translation.name : `Status ${status.id}`,
      };
    });
  }

  public async findOne(id: number): Promise<ProjectStatus> {
    return this.projectStatusRepository.findOneOrFail({
      where: { id },
      relations: ['translations', 'translations.language'],
    });
  }

  public async create(createProjectStatusDto: CreateProjectStatusDto): Promise<ProjectStatus> {
    const status = this.projectStatusRepository.create({
      color: createProjectStatusDto.color,
      project: { id: createProjectStatusDto.projectId } as any,
    });

    const savedStatus = await this.projectStatusRepository.save(status);

    for (const translationDto of createProjectStatusDto.translations) {
      const language = await this.languageRepository.findOneByOrFail({
        code: translationDto.languageCode as any,
      });

      const translation = this.translationRepository.create({
        name: translationDto.name,
        description: translationDto.description,
        projectStatus: savedStatus,
        language,
      });

      await this.translationRepository.save(translation);
    }

    return this.findOne(savedStatus.id);
  }

  public async update(id: number, updateProjectStatusDto: UpdateProjectStatusDto): Promise<ProjectStatus> {
    const status = await this.findOne(id);

    const updateData: any = {};
    if (updateProjectStatusDto.color !== undefined) {
      updateData.color = updateProjectStatusDto.color;
    }
    if (updateProjectStatusDto.isActive !== undefined) {
      updateData.isActive = updateProjectStatusDto.isActive;
    }

    if (Object.keys(updateData).length > 0) {
      await this.projectStatusRepository.update(id, updateData);
    }

    if (updateProjectStatusDto.translations) {
      await this.translationRepository.delete({ projectStatus: { id } });

      for (const translationDto of updateProjectStatusDto.translations) {
        const language = await this.languageRepository.findOneByOrFail({
          code: translationDto.languageCode as any,
        });

        const translation = this.translationRepository.create({
          name: translationDto.name,
          description: translationDto.description,
          projectStatus: status,
          language,
        });

        await this.translationRepository.save(translation);
      }
    }

    return this.findOne(id);
  }

  public async remove(id: number): Promise<void> {
    await this.projectStatusRepository.update(id, { isActive: false });
  }
}
