import { Inject, Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { NotificationType } from 'src/notifications/enums/notification-type.enum';
import { INotificationService } from 'src/notifications/interfaces/notification-service.interface';
import { INotificationServiceToken } from 'src/notifications/tokens/notification-service.token';
import { UserDto } from 'src/users/dtos/user.dto';
import { DataSource, QueryRunner } from 'typeorm';
import { ApiPaginatedResponse } from '../../common/types/api-responses.interface';
import { CustomClsStore } from '../../core/config/types/app.config.type';
import { FileFacade } from '../../core/file/facade/file.facade';
import { Language } from '../../core/language/entities/language.entity';
import { IUsersService } from '../../users/interfaces/users-service.interface';
import { IUsersServiceToken } from '../../users/tokens/users-service.token';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { GetAllProjectsSearchParams } from '../dtos/get-all-projects-search-params.dto';
import { UpdateProjectDto } from '../dtos/update-project.dto';
import { ProjectCategoryTranslation } from '../entities/project-category-translation.entity';
import { ProjectCategory } from '../entities/project-category.entity';
import { ProjectStatusTranslation } from '../entities/project-status-translation.entity';
import { ProjectStatus } from '../entities/project-status.entity';
import { ProjectUserRole } from '../entities/project-user-role.entity';
import { ProjectUser } from '../entities/project-user.entity';
import { Project } from '../entities/project.entity';
import { ProjectRepository } from '../repositories/project.repository';
import { ProjectRoleService } from './project-role.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly dataSource: DataSource,
    private readonly cls: ClsService<CustomClsStore>,
    private readonly fileFacade: FileFacade,
    private readonly projectRoleService: ProjectRoleService,
    @Inject(INotificationServiceToken) private readonly notificationService: INotificationService,
    @Inject(IUsersServiceToken) private readonly usersService: IUsersService,
  ) {}

  public async findAll(params: GetAllProjectsSearchParams): Promise<ApiPaginatedResponse<Project>> {
    const page = Number(params.page) || 0;
    const pageSize = Number(params.pageSize) || 10;
    const skip = page * pageSize;
    const userId = this.cls.get('user').userId;

    const [items, total] = await this.projectRepository.findAllWithParams(params, skip, pageSize, userId);

    return {
      items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  public async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userId = this.cls.get('user').userId;
      const { categories, statuses, typeId, icon, userEmails, usersWithRoles, ...projectData } = createProjectDto;

      let iconFile = null;
      if (icon) {
        iconFile = await this.fileFacade.upload(icon);
      }

      const projectEntity = queryRunner.manager.getRepository(Project).create(projectData);
      if (typeId) {
        projectEntity.type = { id: typeId } as any;
      }
      if (iconFile) {
        projectEntity.icon = { id: iconFile.id } as any;
      }
      const newProject = await queryRunner.manager.getRepository(Project).save(projectEntity);

      await queryRunner.manager.getRepository(ProjectUser).save({
        project: { id: newProject.id },
        user: { id: userId },
      });

      const managerRole = await this.projectRoleService.findOneByCode('manager');
      if (!managerRole) {
        throw new Error('Manager role not found');
      }

      await queryRunner.manager.getRepository(ProjectUserRole).save({
        project: { id: newProject.id },
        user: { id: userId },
        projectRole: { id: managerRole.id },
      });

      if (categories && categories.length > 0) {
        await this.createCategoriesInTransaction(queryRunner, newProject.id, categories);
      }

      if (statuses && statuses.length > 0) {
        await this.createStatusesInTransaction(queryRunner, newProject.id, statuses);
      }

      if (usersWithRoles && usersWithRoles.length > 0) {
        await this.inviteUsersToProjectWithRoles(queryRunner, newProject.id, usersWithRoles, userId);
      } else if (userEmails && userEmails.length > 0) {
        await this.inviteUsersToProject(queryRunner, newProject.id, userEmails, userId);
      }

      await queryRunner.commitTransaction();
      return newProject;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public findOne(id: number): Promise<Project> {
    return this.projectRepository.findOneOrFail({ where: { id } });
  }

  public findOneWithDetails(id: number, currentLanguage: string = 'pl'): Promise<Project> {
    const userId = this.cls.get('user').userId;
    return this.projectRepository.findOneWithDetails(id, userId, currentLanguage);
  }

  public async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const { categories, statuses, typeId, icon, userEmails, usersWithRoles, ...updateData } = updateProjectDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userId = this.cls.get('user').userId;

      let iconFile = null;
      if (icon) {
        iconFile = await this.fileFacade.upload(icon);
      }

      const dataToUpdate = {
        ...updateData,
        dateModification: new Date(),
      };

      if (typeId) {
        (dataToUpdate as any).type = { id: typeId };
      }

      if (iconFile) {
        (dataToUpdate as any).icon = { id: iconFile.id };
      }

      await queryRunner.manager.getRepository(Project).update(id, dataToUpdate);

      if (categories && categories.length > 0) {
        await queryRunner.manager.getRepository(ProjectCategory).delete({ project: { id } });
        await this.createCategoriesInTransaction(queryRunner, id, categories);
      }

      if (statuses && statuses.length > 0) {
        await queryRunner.manager.getRepository(ProjectStatus).delete({ project: { id } });
        await this.createStatusesInTransaction(queryRunner, id, statuses);
      }

      if (usersWithRoles && usersWithRoles.length > 0) {
        await this.inviteUsersToProjectWithRoles(queryRunner, id, usersWithRoles, userId);
      } else if (userEmails && userEmails.length > 0) {
        await this.inviteUsersToProject(queryRunner, id, userEmails, userId);
      }

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error updating project:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public async remove(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.getRepository(ProjectUser).delete({ project: { id } });
      await queryRunner.manager.getRepository(Project).delete(id);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createCategoriesInTransaction(
    queryRunner: QueryRunner,
    projectId: number,
    categories: string[],
  ): Promise<void> {
    for (const categoryName of categories) {
      const category = queryRunner.manager.getRepository(ProjectCategory).create({
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        project: { id: projectId },
      });

      const savedCategory = await queryRunner.manager.getRepository(ProjectCategory).save(category);
      const languages = await queryRunner.manager.getRepository(Language).find();

      for (const language of languages) {
        const translation = queryRunner.manager.getRepository(ProjectCategoryTranslation).create({
          name: categoryName,
          description: null,
          projectCategory: savedCategory,
          language: language,
        });

        await queryRunner.manager.getRepository(ProjectCategoryTranslation).save(translation);
      }
    }
  }

  private async createStatusesInTransaction(
    queryRunner: QueryRunner,
    projectId: number,
    statuses: string[],
  ): Promise<void> {
    for (const statusName of statuses) {
      const status = queryRunner.manager.getRepository(ProjectStatus).create({
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        project: { id: projectId },
      });

      const savedStatus = await queryRunner.manager.getRepository(ProjectStatus).save(status);

      const languages = await queryRunner.manager.getRepository(Language).find();

      for (const language of languages) {
        const translation = queryRunner.manager.getRepository(ProjectStatusTranslation).create({
          name: statusName,
          description: null,
          projectStatus: savedStatus,
          language: language,
        });

        await queryRunner.manager.getRepository(ProjectStatusTranslation).save(translation);
      }
    }
  }

  private async inviteUsersToProject(
    queryRunner: QueryRunner,
    projectId: number,
    userEmails: string[],
    inviterId: number,
  ): Promise<void> {
    console.log('Inviting users to project:', { projectId, userEmails, inviterId });

    const inviter = await this.usersService.findOne(inviterId);
    if (!inviter) {
      throw new Error('Inviter not found');
    }

    for (const email of userEmails) {
      try {
        const user = await this.usersService.findByEmail(email);

        if (user) {
          const existingProjectUser = await queryRunner.manager
            .getRepository(ProjectUser)
            .findOne({
              where: {
                project: { id: projectId },
                user: { id: user.id },
              },
            });

          if (!existingProjectUser) {
            await queryRunner.manager.getRepository(ProjectUser).save({
              project: { id: projectId },
              user: { id: user.id },
            });

            const memberRole = await this.projectRoleService.findOneByCode('member');
            if (!memberRole) {
              throw new Error('Member role not found');
            }

            await queryRunner.manager.getRepository(ProjectUserRole).save({
              project: { id: projectId },
              user: { id: user.id },
              projectRole: { id: memberRole.id },
            });
            await this.notificationService.createNotification({
              type: NotificationType.PROJECT_INVITATION,
              title: 'Zaproszenie do projektu',
              message: `${inviter.email} zaprosił Cię do projektu.`,
              recipientId: user.id,
              data: { projectId, inviterEmail: inviter.email },
              sendEmail: true,
            });
          }
        }
      } catch (error) {
        console.error(`Error inviting user ${email}:`, error);
      }
    }
  }

  private async inviteUsersToProjectWithRoles(
    queryRunner: QueryRunner,
    projectId: number,
    usersWithRoles: { email: string; role: number; }[],
    inviterId: number,
  ): Promise<void> {
    console.log('Inviting users to project with roles:', { projectId, usersWithRoles, inviterId });

    const inviter = await this.usersService.findOne(inviterId);
    if (!inviter) {
      throw new Error('Inviter not found');
    }

    for (const userWithRole of usersWithRoles) {
      try {
        const user = await this.usersService.findByEmail(userWithRole.email);

        if (user) {
          const existingProjectUser = await queryRunner.manager
            .getRepository(ProjectUser)
            .findOne({
              where: {
                project: { id: projectId },
                user: { id: user.id },
              },
            });

          if (!existingProjectUser) {
            await queryRunner.manager.getRepository(ProjectUser).save({
              project: { id: projectId },
              user: { id: user.id },
            });

            await queryRunner.manager.getRepository(ProjectUserRole).save({
              project: { id: projectId },
              user: { id: user.id },
              projectRole: { id: userWithRole.role },
            });

            const roleInfo = await this.projectRoleService.findOneById(userWithRole.role);
            const roleName = roleInfo?.translations?.[0]?.name || 'nieznana';

            await this.notificationService.createNotification({
              type: NotificationType.PROJECT_INVITATION,
              title: 'Zaproszenie do projektu',
              message: `${inviter.email} zaprosił Cię do projektu z rolą ${roleName}.`,
              recipientId: user.id,
              data: { projectId, inviterEmail: inviter.email, role: userWithRole.role },
              sendEmail: true,
            });
          }
        }
      } catch (error) {
        console.error(`Error inviting user ${userWithRole.email}:`, error);
      }
    }
  }

  public async getProjectUsers(projectId: number): Promise<UserDto[]> {
    const projectUsers = await this.dataSource
      .getRepository(ProjectUserRole)
      .createQueryBuilder('pur')
      .leftJoinAndSelect('pur.user', 'user')
      .leftJoinAndSelect('pur.project', 'project')
      .where('project.id = :projectId', { projectId })
      .select([
        'pur.id',
        'user.id',
        'user.email',
      ])
      .getMany();

    return projectUsers.map(pur => ({
      id: pur.user.id,
      name: pur.user.email,
    }));
  }
}
