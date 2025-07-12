import { Inject, Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { I18nService } from 'nestjs-i18n';
import { NotificationTypeEnum } from 'src/notifications/enums/notification-type.enum';
import { INotificationService } from 'src/notifications/interfaces/notification-service.interface';
import { INotificationServiceToken } from 'src/notifications/tokens/notification-service.token';
import { UserDto } from 'src/users/dtos/user.dto';
import { DataSource, QueryRunner } from 'typeorm';
import { ApiPaginatedResponse } from '../../common/types/api-responses.interface';
import { CustomClsStore } from '../../core/config/types/app.config.type';
import { FileFacade } from '../../core/file/facade/file.facade';
import { Language } from '../../core/language/entities/language.entity';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { IUsersService } from '../../users/interfaces/users-service.interface';
import { IUsersServiceToken } from '../../users/tokens/users-service.token';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { GetAllProjectsSearchParamsDto } from '../dtos/get-all-projects-search-params.dto';
import { UpdateProjectDto } from '../dtos/update-project.dto';
import { ProjectCategoryTranslation } from '../entities/project-category-translation.entity';
import { ProjectCategory } from '../entities/project-category.entity';
import { ProjectInvitation } from '../entities/project-invitation.entity';
import { ProjectStatusTranslation } from '../entities/project-status-translation.entity';
import { ProjectStatus } from '../entities/project-status.entity';
import { ProjectUserRole } from '../entities/project-user-role.entity';
import { Project } from '../entities/project.entity';
import { ProjectInvitationStatusEnum } from '../enums/project-invitation-status.enum';
import { ProjectRoleEnum } from '../enums/project-role.enum';
import { ProjectInvitationRepository } from '../repositories/project-invitation.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { ProjectRoleService } from './project-role.service';
import { ProjectUserRoleService } from './project-user-role.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly dataSource: DataSource,
    private readonly cls: ClsService<CustomClsStore>,
    private readonly fileFacade: FileFacade,
    private readonly projectRoleService: ProjectRoleService,
    private readonly projectUserRoleService: ProjectUserRoleService,
    private readonly projectInvitationRepository: ProjectInvitationRepository,
    private readonly i18n: I18nService<I18nTranslations>,
    @Inject(INotificationServiceToken) private readonly notificationService: INotificationService,
    @Inject(IUsersServiceToken) private readonly usersService: IUsersService,
  ) {}

  public async findAll(params: GetAllProjectsSearchParamsDto): Promise<ApiPaginatedResponse<Project>> {
    const page = Number(params.page) || 0;
    const pageSize = Number(params.pageSize) || 10;
    const skip = page * pageSize;
    const userId = this.cls.get('user').userId;

    const [items, total] = await this.projectRepository.findAllWithParams(params, skip, pageSize, userId);

    for (const project of items) {
      const userRole = await this.projectUserRoleService.getUserRoleCodeInProject(project.id, userId);
      project.currentUserRole = userRole || undefined;
    }

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

      const managerRole = await this.projectRoleService.findOneByCode(ProjectRoleEnum.MANAGER);
      if (!managerRole) {
        throw new Error(this.i18n.t('messages.Projects.errors.managerRoleNotFound'));
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

  public async findOneWithDetails(id: number, currentLanguage: string = 'pl'): Promise<Project> {
    const userId = this.cls.get('user').userId;
    const project = await this.projectRepository.findOneWithDetails(id, userId, currentLanguage);

    const isPublic = project.isPublic;
    const isMember = project.projectUserRoles?.some(role => role.user.id === userId);
    if (!isPublic && !isMember) {
      throw new Error(this.i18n.t('messages.Projects.errors.projectNotFoundOrAccessDenied'));
    }

    const userRole = await this.projectUserRoleService.getUserRoleCodeInProject(id, userId);
    project.currentUserRole = userRole || undefined;

    return project;
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

      await this.checkProjectEditPermission(id, userId);

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

      if (usersWithRoles && usersWithRoles.length >= 0) {
        await this.updateProjectUsersWithRoles(queryRunner, id, usersWithRoles, userId);
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
    const userId = this.cls.get('user').userId;

    await this.checkProjectEditPermission(id, userId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.getRepository(ProjectUserRole).delete({ project: { id } });

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
    const inviter = await this.usersService.findOne(inviterId);
    if (!inviter) {
      throw new Error(this.i18n.t('messages.Projects.errors.inviterNotFound'));
    }

    const project = await queryRunner.manager.getRepository(Project).findOne({ where: { id: projectId } });
    const projectName = project?.name || '';
    for (const email of userEmails) {
      try {
        const user = await this.usersService.findByEmail(email);

        if (user) {
          const existingInvitation = await queryRunner.manager.getRepository(ProjectInvitation).findOne({
            where: {
              project: { id: projectId },
              user: { id: user.id },
              status: ProjectInvitationStatusEnum.PENDING,
            },
          });
          if (!existingInvitation) {
            const invitation = queryRunner.manager.getRepository(ProjectInvitation).create({
              project: { id: projectId },
              user: { id: user.id },
              inviter: { id: inviterId },
              status: ProjectInvitationStatusEnum.PENDING,
            });
            await queryRunner.manager.getRepository(ProjectInvitation).save(invitation);

            await this.notificationService.createNotification({
              type: NotificationTypeEnum.PROJECT_INVITATION,
              title: this.i18n.t('messages.Projects.notifications.invitationTitle'),
              message: this.i18n.t('messages.Projects.notifications.invitationMessage', {
                args: {
                  inviterEmail: inviter.email,
                  projectName,
                },
              }),
              recipientId: user.id,
              data: { projectId, projectName, inviterEmail: inviter.email, invitationId: invitation.id },
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
    const inviter = await this.usersService.findOne(inviterId);
    if (!inviter) {
      throw new Error(this.i18n.t('messages.Projects.errors.inviterNotFound'));
    }

    const project = await queryRunner.manager.getRepository(Project).findOne({ where: { id: projectId } });
    const projectName = project?.name || '';
    for (const userWithRole of usersWithRoles) {
      try {
        const user = await this.usersService.findByEmail(userWithRole.email);

        if (user) {
          const existingInvitation = await queryRunner.manager.getRepository(ProjectInvitation).findOne({
            where: {
              project: { id: projectId },
              user: { id: user.id },
              status: ProjectInvitationStatusEnum.PENDING,
            },
          });
          if (!existingInvitation) {
            const invitation = queryRunner.manager.getRepository(ProjectInvitation).create({
              project: { id: projectId },
              user: { id: user.id },
              inviter: { id: inviterId },
              role: { id: userWithRole.role },
              status: ProjectInvitationStatusEnum.PENDING,
            });
            await queryRunner.manager.getRepository(ProjectInvitation).save(invitation);

            const roleInfo = await this.projectRoleService.findOneById(userWithRole.role);
            const roleName = roleInfo?.translations?.[0]?.name || 'nieznana';

            await this.notificationService.createNotification({
              type: NotificationTypeEnum.PROJECT_INVITATION,
              title: this.i18n.t('messages.Projects.notifications.invitationTitle'),
              message: this.i18n.t('messages.Projects.notifications.invitationMessage', {
                args: {
                  inviterEmail: inviter.email,
                  projectName,
                },
              }),
              recipientId: user.id,
              data: {
                projectId,
                projectName,
                inviterEmail: inviter.email,
                role: userWithRole.role,
                invitationId: invitation.id,
              },
              sendEmail: true,
            });
          }
        }
      } catch (error) {
        console.error(`Error inviting user ${userWithRole.email}:`, error);
      }
    }
  }

  private async updateProjectUsersWithRoles(
    queryRunner: QueryRunner,
    projectId: number,
    usersWithRoles: { email: string; role: number; }[],
    updaterId: number,
  ): Promise<void> {
    const updater = await this.usersService.findOne(updaterId);
    if (!updater) {
      throw new Error(this.i18n.t('messages.Projects.errors.updaterNotFound'));
    }

    const currentProjectUsers = await queryRunner.manager
      .getRepository(ProjectUserRole)
      .find({
        where: { project: { id: projectId } },
        relations: ['user', 'projectRole'],
      });

    const newUserEmails = usersWithRoles.map(u => u.email);

    if (!newUserEmails.includes(updater.email)) {
      throw new Error(this.i18n.t('messages.Projects.errors.updaterNotInNewUsersList'));
    }

    for (const currentUser of currentProjectUsers) {
      if (!newUserEmails.includes(currentUser.user.email)) {
        if (currentUser.user.id === updaterId) {
          throw new Error(this.i18n.t('messages.Projects.errors.cannotRemoveYourselfFromProject'));
        }
        const isManager = currentUser.projectRole
          && currentUser.projectRole.id === (await this.projectRoleService.findOneByCode(ProjectRoleEnum.MANAGER))?.id;
        if (isManager) {
          const managersLeft = currentProjectUsers.filter(u =>
            u.projectRole && u.projectRole.id === currentUser.projectRole.id && newUserEmails.includes(u.user.email)
          ).length;
          if (managersLeft === 0) {
            throw new Error(this.i18n.t('messages.Projects.errors.lastManagerCannotBeRemoved'));
          }
        }
        await queryRunner.manager.getRepository(ProjectUserRole).remove(currentUser);
      }
    }

    for (const userWithRole of usersWithRoles) {
      try {
        const user = await this.usersService.findByEmail(userWithRole.email);
        if (user) {
          const existingUserRole = currentProjectUsers.find(
            cu => cu.user.email === userWithRole.email,
          );
          if (existingUserRole) {
            if (existingUserRole.projectRole.id !== userWithRole.role) {
              existingUserRole.projectRole = { id: userWithRole.role } as any;
              await queryRunner.manager.getRepository(ProjectUserRole).save(existingUserRole);
            }
          } else {
            await queryRunner.manager.getRepository(ProjectUserRole).save({
              project: { id: projectId },
              user: { id: user.id },
              projectRole: { id: userWithRole.role },
            });
          }
        }
      } catch (error) {
        console.error(`Error updating user ${userWithRole.email}:`, error);
      }
    }
  }

  public async getProjectUsers(projectId: number): Promise<UserDto[]> {
    const userId = this.cls.get('user').userId;

    const project = await this.projectRepository.findOne({
      where: [
        {
          id: projectId,
          projectUserRoles: {
            user: { id: userId },
          },
        },
        {
          id: projectId,
          isPublic: true,
        },
      ],
    });

    if (!project) {
      throw new Error(this.i18n.t('messages.Projects.errors.projectNotFoundOrAccessDenied'));
    }

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

  private async checkProjectEditPermission(projectId: number, userId: number): Promise<void> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      select: ['id', 'isPublic'],
    });

    if (!project) {
      throw new Error(this.i18n.t('messages.Projects.errors.projectNotFound'));
    }

    if (project.isPublic) {
      const hasManagerRole = await this.projectUserRoleService.hasManagerRole(projectId, userId);
      if (!hasManagerRole) {
        throw new Error(this.i18n.t('messages.Projects.errors.accessDeniedToEditPublicProject'));
      }
    } else {
      const isProjectMember = await this.projectRepository.findOne({
        where: {
          id: projectId,
          projectUserRoles: {
            user: { id: userId },
          },
        },
      });

      if (!isProjectMember) {
        throw new Error(this.i18n.t('messages.Projects.errors.accessDeniedToEditPrivateProject'));
      }
    }
  }

  public async acceptInvitation(invitationId: number): Promise<void> {
    const userId = this.cls.get('user').userId;
    const invitation = await this.projectInvitationRepository.findOne({
      where: { id: invitationId },
      relations: ['user', 'project', 'role'],
    });
    if (!invitation || invitation.status !== ProjectInvitationStatusEnum.PENDING) {
      throw new Error(this.i18n.t('messages.Projects.errors.invitationNotFoundOrAlreadyHandled'));
    }
    if (invitation.user.id !== userId) {
      throw new Error(this.i18n.t('messages.Projects.errors.notAllowedToAcceptInvitation'));
    }
    await this.dataSource.transaction(async manager => {
      if (invitation.role) {
        await manager.getRepository(ProjectUserRole).save({
          project: invitation.project,
          user: invitation.user,
          projectRole: invitation.role,
        });
      }
      invitation.status = ProjectInvitationStatusEnum.ACCEPTED;
      await manager.getRepository(ProjectInvitation).save(invitation);
    });
  }

  public async rejectInvitation(invitationId: number): Promise<void> {
    const userId = this.cls.get('user').userId;
    const invitation = await this.projectInvitationRepository.findOne({
      where: { id: invitationId },
      relations: ['user'],
    });
    if (!invitation || invitation.status !== ProjectInvitationStatusEnum.PENDING) {
      throw new Error(this.i18n.t('messages.Projects.errors.invitationNotFoundOrAlreadyHandled'));
    }
    if (invitation.user.id !== userId) {
      throw new Error(this.i18n.t('messages.Projects.errors.notAllowedToRejectInvitation'));
    }
    invitation.status = ProjectInvitationStatusEnum.REJECTED;
    await this.projectInvitationRepository.save(invitation);
  }
}
