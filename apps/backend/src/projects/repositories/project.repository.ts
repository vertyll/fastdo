import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { GetAllProjectsSearchParamsDto } from '../dtos/get-all-projects-search-params.dto';
import { ProjectUserRole } from '../entities/project-user-role.entity';
import { Project } from '../entities/project.entity';

@Injectable()
export class ProjectRepository extends Repository<Project> {
  constructor(private readonly dataSource: DataSource) {
    super(Project, dataSource.createEntityManager());
  }

  public async findAllWithParams(
    params: GetAllProjectsSearchParamsDto,
    skip: number,
    take: number,
    userId: number,
  ): Promise<[Project[], number]> {
    const query = this.dataSource
      .createQueryBuilder(Project, 'project')
      .leftJoin(
        ProjectUserRole,
        'projectUserRole',
        'projectUserRole.project.id = project.id AND projectUserRole.user.id = :userId',
        { userId },
      )
      .leftJoinAndSelect('project.type', 'type')
      .leftJoinAndSelect('project.icon', 'icon')
      .leftJoinAndSelect('projectUserRole.projectRole', 'projectRole')
      .leftJoinAndSelect('projectRole.permissions', 'permissions');

    query.where(
      '(projectUserRole.user.id = :userId OR project.isPublic = true)',
      { userId },
    );

    if (params.typeIds && params.typeIds.length > 0) {
      query
        .andWhere('type.id IS NOT NULL')
        .andWhere('type.id IN (:...typeIds)', { typeIds: params.typeIds });
    }

    if (params.q) {
      query.andWhere('project.name LIKE :q', { q: `%${params.q}%` });
    }

    if (params.createdFrom && params.createdFrom !== '') {
      query.andWhere('project.dateCreation >= :createdFrom', {
        createdFrom: params.createdFrom,
      });
    }

    if (params.createdTo && params.createdTo !== '') {
      query.andWhere('project.dateCreation <= :createdTo', {
        createdTo: params.createdTo,
      });
    }

    if (params.updatedFrom && params.updatedFrom !== '') {
      query.andWhere('project.dateModification >= :updatedFrom', {
        updatedFrom: params.updatedFrom,
      });
    }

    if (params.updatedTo && params.updatedTo !== '') {
      query.andWhere('project.dateModification <= :updatedTo', {
        updatedTo: params.updatedTo,
      });
    }

    if (params.sortBy && params.orderBy) {
      query.orderBy(
        `project.${params.sortBy}`,
        params.orderBy.toUpperCase() as 'ASC' | 'DESC',
      );
    } else {
      query.orderBy('project.dateCreation', 'DESC');
    }

    query.skip(skip).take(take);

    return query.getManyAndCount();
  }

  public async findOneWithDetails(
    id: number,
    userId: number,
    currentLanguage: string = 'pl',
  ): Promise<Project> {
    const project = await this.findOneOrFail({
      where: { id },
      relations: [
        'type',
        'type.translations',
        'type.translations.language',
        'icon',
        'categories',
        'categories.translations',
        'categories.translations.language',
        'statuses',
        'statuses.translations',
        'statuses.translations.language',
        'projectUserRoles',
        'projectUserRoles.user',
        'projectUserRoles.projectRole',
        'projectUserRoles.projectRole.translations',
        'projectUserRoles.projectRole.translations.language',
        'projectUserRoles.projectRole.permissions',
      ],
    });

    if (project.categories) {
      project.categories = project.categories.map(category => {
        const translation = category.translations?.find(
          t => t.language.code === currentLanguage,
        );
        return {
          ...category,
          name: translation?.name || category.translations?.[0]?.name || '',
          translations: undefined, // Remove translations to clean up response
        } as any;
      });
    }

    if (project.statuses) {
      project.statuses = project.statuses.map(status => {
        const translation = status.translations?.find(
          t => t.language.code === currentLanguage,
        );
        return {
          ...status,
          name: translation?.name || status.translations?.[0]?.name || '',
          translations: undefined, // Remove translations to clean up response
        } as any;
      });
    }

    if (project.type) {
      const typeTranslation = project.type.translations?.find(
        t => t.language.code === currentLanguage,
      );
      project.type = {
        ...project.type,
        name: typeTranslation?.name || project.type.translations?.[0]?.name || '',
        description: typeTranslation?.description
          || project.type.translations?.[0]?.description,
        translations: undefined, // Remove translations to clean up response
      } as any;
    }

    if (project.projectUserRoles) {
      project.projectUserRoles = project.projectUserRoles.map(userRole => {
        const roleTranslation = userRole.projectRole?.translations?.find(
          t => t.language.code === currentLanguage,
        );
        return {
          ...userRole,
          projectRole: {
            ...userRole.projectRole,
            name: roleTranslation?.name
              || userRole.projectRole?.translations?.[0]?.name
              || '',
            description: roleTranslation?.description
              || userRole.projectRole?.translations?.[0]?.description,
          },
          user: {
            id: userRole.user.id,
            email: userRole.user.email,
            // Only include necessary user fields for security
          },
        } as any;
      });
    }

    return project;
  }
}
