import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectRoleTranslation } from '../entities/project-role-translation.entity';
import { ProjectRole } from '../entities/project-role.entity';

@Injectable()
export class ProjectRoleRepository {
  constructor(
    @InjectRepository(ProjectRole) private readonly projectRoleRepository: Repository<ProjectRole>,
    @InjectRepository(ProjectRoleTranslation) private readonly projectRoleTranslationRepository: Repository<
      ProjectRoleTranslation
    >,
  ) {}

  public async findAllWithTranslations(): Promise<{ id: number; translations: { lang: string; name: string; description?: string }[] }[]> {
    const roles = await this.projectRoleRepository
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .where('pr.isActive = :isActive', { isActive: true })
      .orderBy('pr.id', 'ASC')
      .getMany();

    return roles.map(role => ({
      id: role.id,
      translations: (role.translations || []).map(t => ({
        lang: t.language?.code,
        name: t.name,
        description: t.description,
      })),
    }));
  }

  public async findOneByCode(code: string): Promise<ProjectRole | null> {
    return this.projectRoleRepository.findOne({
      where: { code },
      relations: ['translations', 'translations.language'],
    });
  }

  public async findOneById(id: number, languageCode: string = 'pl'): Promise<ProjectRole | null> {
    return this.projectRoleRepository
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .where('pr.id = :id', { id })
      .andWhere('language.code = :languageCode', { languageCode })
      .getOne();
  }
}
