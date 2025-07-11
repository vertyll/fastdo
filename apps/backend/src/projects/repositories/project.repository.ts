import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { GetAllProjectsSearchParamsDto } from '../dtos/get-all-projects-search-params.dto';
import { ProjectUser } from '../entities/project-user.entity';
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
    console.log('=== findAllWithParams DEBUG ===');
    console.log('Received params:', JSON.stringify(params, null, 2));
    console.log('typeIds:', params.typeIds);
    console.log('typeIds type:', typeof params.typeIds);
    console.log('typeIds length:', params.typeIds?.length);
    console.log('userId:', userId);

    const query = this.dataSource
      .createQueryBuilder(Project, 'project')
      .leftJoin(
        ProjectUser,
        'projectUser',
        'projectUser.project.id = project.id AND projectUser.user.id = :userId',
        { userId },
      )
      .leftJoinAndSelect('project.type', 'type');

    query.where('(projectUser.user.id = :userId OR project.isPublic = true)', { userId });

    // DODAJ WIĘCEJ DEBUGOWANIA
    console.log('=== BEFORE TYPE FILTER ===');
    console.log('Current SQL:', query.getSql());
    console.log('Current parameters:', query.getParameters());

    if (params.typeIds && params.typeIds.length > 0) {
      console.log('=== APPLYING TYPE FILTER ===');
      console.log('typeIds to filter:', params.typeIds);
      console.log('typeIds is array:', Array.isArray(params.typeIds));

      query.andWhere('type.id IS NOT NULL')
        .andWhere('type.id IN (:...typeIds)', { typeIds: params.typeIds });

      console.log('=== AFTER TYPE FILTER ===');
      console.log('SQL after type filter:', query.getSql());
      console.log('Parameters after type filter:', query.getParameters());
    } else {
      console.log('=== NO TYPE FILTER APPLIED ===');
      console.log('typeIds is falsy or empty:', !params.typeIds || params.typeIds.length === 0);
    }

    // reszta kodu...

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

    console.log('=== FINAL QUERY ===');
    console.log('Final SQL:', query.getSql());
    console.log('Final parameters:', query.getParameters());
    console.log('=== END DEBUG ===');

    return query.getManyAndCount();
  }

  public async findOneWithDetails(
    id: number,
    userId: number,
    currentLanguage: string = 'pl',
  ): Promise<Project> {
    const project = await this.findOneOrFail({
      where: [
        {
          id,
          projectUsers: {
            user: { id: userId },
          },
        },
        {
          id,
          isPublic: true,
        },
      ],
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
        'userRoles',
        'userRoles.user',
        'userRoles.projectRole',
        'userRoles.projectRole.translations',
        'userRoles.projectRole.translations.language',
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

    if (project.userRoles) {
      project.userRoles = project.userRoles.map(userRole => {
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
            translations: undefined, // Remove translations to clean up response
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
