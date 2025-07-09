import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LanguageCodeEnum } from 'src/core/language/enums/language-code.enum';
import { Repository } from 'typeorm';
import { ProjectRoleResponseDto } from '../dtos/project-role-response.dto';
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

  public async findAll(): Promise<ProjectRoleResponseDto[]> {
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

  public async findOneById(id: number, lang: string = LanguageCodeEnum.POLISH): Promise<ProjectRole | null> {
    return this.projectRoleRepository
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .where('pr.id = :id', { id })
      .andWhere('language.code = :lang', { lang })
      .getOne();
  }
}
