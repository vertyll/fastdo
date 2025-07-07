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

  public async findAll(languageCode: string = 'pl'): Promise<{ id: number; name: string; description?: string; }[]> {
    const roles = await this.projectRoleRepository
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .where('pr.isActive = :isActive', { isActive: true })
      .andWhere('language.code = :languageCode', { languageCode })
      .orderBy('pr.id', 'ASC')
      .getMany();

    return roles.map(role => ({
      id: role.id,
      name: role.translations[0]?.name || role.code,
      description: role.translations[0]?.description,
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
