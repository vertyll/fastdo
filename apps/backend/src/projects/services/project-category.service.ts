import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { LanguageCodeEnum } from '../../core/language/enums/language-code.enum';
import { CreateProjectCategoryDto } from '../dtos/create-project-category.dto';
import { ProjectCategoryDto } from '../dtos/project-category.dto';
import { UpdateProjectCategoryDto } from '../dtos/update-project-category.dto';
import { ProjectCategoryTranslation } from '../entities/project-category-translation.entity';
import { ProjectCategory } from '../entities/project-category.entity';
import { ProjectCategoryRepository } from '../repositories/project-category.repository';

@Injectable()
export class ProjectCategoryService {
  constructor(
    private readonly projectCategoryRepository: ProjectCategoryRepository,
    @InjectRepository(ProjectCategoryTranslation) private readonly translationRepository: Repository<
      ProjectCategoryTranslation
    >,
    @InjectRepository(Language) private readonly languageRepository: Repository<Language>,
  ) {}

  public async findByProjectId(
    projectId: number,
    languageCode: LanguageCodeEnum = LanguageCodeEnum.POLISH,
  ): Promise<ProjectCategoryDto[]> {
    const categories = await this.projectCategoryRepository.find({
      where: { project: { id: projectId }, isActive: true },
      relations: ['translations', 'translations.language'],
    });

    return categories.map(category => {
      const translation = category.translations.find(t => t.language.code === languageCode)
        || category.translations[0]; // fallback to first translation

      return {
        id: category.id,
        name: translation ? translation.name : `Category ${category.id}`,
      };
    });
  }

  public async findOne(id: number): Promise<ProjectCategory> {
    return this.projectCategoryRepository.findOneOrFail({
      where: { id },
      relations: ['translations', 'translations.language'],
    });
  }

  public async create(createProjectCategoryDto: CreateProjectCategoryDto): Promise<ProjectCategory> {
    const category = this.projectCategoryRepository.create({
      color: createProjectCategoryDto.color,
      project: { id: createProjectCategoryDto.projectId } as any,
    });

    const savedCategory = await this.projectCategoryRepository.save(category);

    for (const translationDto of createProjectCategoryDto.translations) {
      const language = await this.languageRepository.findOneByOrFail({
        code: translationDto.languageCode as any,
      });

      const translation = this.translationRepository.create({
        name: translationDto.name,
        description: translationDto.description,
        projectCategory: savedCategory,
        language,
      });

      await this.translationRepository.save(translation);
    }

    return this.findOne(savedCategory.id);
  }

  public async update(id: number, updateProjectCategoryDto: UpdateProjectCategoryDto): Promise<ProjectCategory> {
    const category = await this.findOne(id);

    const updateData: any = {};
    if (updateProjectCategoryDto.color !== undefined) {
      updateData.color = updateProjectCategoryDto.color;
    }
    if (updateProjectCategoryDto.isActive !== undefined) {
      updateData.isActive = updateProjectCategoryDto.isActive;
    }

    if (Object.keys(updateData).length > 0) {
      await this.projectCategoryRepository.update(id, updateData);
    }

    if (updateProjectCategoryDto.translations) {
      await this.translationRepository.delete({ projectCategory: { id } });

      for (const translationDto of updateProjectCategoryDto.translations) {
        const language = await this.languageRepository.findOneByOrFail({
          code: translationDto.languageCode as any,
        });

        const translation = this.translationRepository.create({
          name: translationDto.name,
          description: translationDto.description,
          projectCategory: category,
          language,
        });

        await this.translationRepository.save(translation);
      }
    }

    return this.findOne(id);
  }

  public async remove(id: number): Promise<void> {
    await this.projectCategoryRepository.update(id, { isActive: false });
  }
}
