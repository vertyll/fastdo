import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { I18nService } from 'nestjs-i18n';
import { Notification } from 'src/notifications/entities/notification.entity';
import { NotificationTypeEnum } from 'src/notifications/enums/notification-type.enum';
import { INotificationsService } from 'src/notifications/interfaces/notifications-service.interface';
import { INotificationsServiceToken } from 'src/notifications/tokens/notifications-service.token';
import { UserDto } from 'src/users/dtos/user.dto';
import { DataSource, EntityManager, In, QueryRunner, Repository } from 'typeorm';
import { TranslationDto } from '../../common/dtos/translation.dto';
import { ApiPaginatedResponse } from '../../common/types/api-responses.interface';
import { CustomClsStore } from '../../core/config/types/app.config.type';
import { FileFacade } from '../../core/file/facade/file.facade';
import { Language } from '../../core/language/entities/language.entity';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { IUsersService } from '../../users/interfaces/users-service.interface';
import { IUsersServiceToken } from '../../users/tokens/users-service.token';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { GetAllProjectsSearchParamsDto } from '../dtos/get-all-projects-search-params.dto';
import { ProjectDetailsResponseDto } from '../dtos/project-details-response.dto';
import { ProjectListResponseDto } from '../dtos/project-list-response.dto';
import { UpdateProjectDto } from '../dtos/update-project.dto';
import { ProjectCategoryTranslation } from '../entities/project-category-translation.entity';
import { ProjectCategory } from '../entities/project-category.entity';
import { ProjectInvitation } from '../entities/project-invitation.entity';
import { ProjectRole } from '../entities/project-role.entity';
import { ProjectStatusTranslation } from '../entities/project-status-translation.entity';
import { ProjectStatus } from '../entities/project-status.entity';
import { ProjectUserRole } from '../entities/project-user-role.entity';
import { Project } from '../entities/project.entity';
import { ProjectInvitationStatusEnum } from '../enums/project-invitation-status.enum';
import { ProjectRolePermissionEnum } from '../enums/project-role-permission.enum';
import { ProjectRoleEnum } from '../enums/project-role.enum';
import { ProjectInvitationRepository } from '../repositories/project-invitation.repository';
import { ProjectUserRoleRepository } from '../repositories/project-user-role.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { ProjectRolesService } from './project-roles.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly dataSource: DataSource,
    private readonly cls: ClsService<CustomClsStore>,
    private readonly fileFacade: FileFacade,
    private readonly projectRoleService: ProjectRolesService,
    private readonly projectInvitationRepository: ProjectInvitationRepository,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly projectUserRoleRepository: ProjectUserRoleRepository,
    @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
    @Inject(INotificationsServiceToken) private readonly notificationService: INotificationsService,
    @Inject(IUsersServiceToken) private readonly usersService: IUsersService,
  ) {}

  public async findAll(params: GetAllProjectsSearchParamsDto): Promise<ApiPaginatedResponse<ProjectListResponseDto>> {
    const page = Number(params.page) || 0;
    const pageSize = Number(params.pageSize) || 10;
    const skip = page * pageSize;
    const userId = this.cls.get('user').userId;

    const [items, total] = await this.projectRepository.findAllWithParams(params, skip, pageSize, userId);

    const projectUserRoles = await this.projectUserRoleRepository.find({
      where: { user: { id: userId }, project: { id: In(items.map(item => item.id)) } },
      relations: [
        'projectRole',
        'project',
        'projectRole.translations',
        'projectRole.permissions',
        'project.type',
        'project.type.translations',
        'project.type.translations.language',
      ],
    });

    const userRolesByProjectId = new Map<number, ProjectUserRole>();
    projectUserRoles.forEach(role => {
      userRolesByProjectId.set(role.project.id, role);
    });

    const data = items.map(item => {
      const userRole = userRolesByProjectId.get(item.id);
      return this.mapProjectToListResponseDto(item, userRole);
    });

    return {
      items: data,
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
        await this.validateUsersExist(usersWithRoles.map(u => u.email));
        await this.inviteUsersToProjectWithRoles(queryRunner, newProject.id, usersWithRoles, userId);
      } else if (userEmails && userEmails.length > 0) {
        await this.validateUsersExist(userEmails);
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

  public async findOneWithDetails(id: number, currentLanguage: string = 'pl'): Promise<ProjectDetailsResponseDto> {
    const userId = this.cls.get('user').userId;
    const project = await this.projectRepository.findOneWithDetails(id, userId, currentLanguage);

    const isPublic = project.isPublic;
    const isMember = project.projectUserRoles?.some(role => role.user.id === userId);
    if (!isPublic && !isMember) {
      throw new Error(this.i18n.t('messages.Projects.errors.projectNotFoundOrAccessDenied'));
    }

    const userRole = project.projectUserRoles?.find(role => role.user.id === userId);
    return this.mapProjectToDetailsResponseDto(project, userRole);
  }

  public async update(id: number, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const { categories, statuses, typeId, icon, userEmails, usersWithRoles, ...updateData } = updateProjectDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userId = this.cls.get('user').userId;
      const project = await this.projectRepository.findOne({ where: { id }, relations: ['categories', 'statuses'] });
      if (!project) {
        throw new Error(this.i18n.t('messages.Projects.errors.projectNotFound'));
      }
      await this.checkProjectManagementPermission(id, userId);

      let iconFile = null;
      if (String(icon) === 'null' || icon === null) {
        if (project.icon) {
          await this.fileFacade.delete(project.icon.id);
        }
        (updateData as any).icon = null;
      } else if (icon) {
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

      await this.handleCategoriesUpdate(queryRunner, id, categories);
      await this.handleStatusesUpdate(queryRunner, id, statuses);
      await this.handleUsersUpdate(queryRunner, id, usersWithRoles, userEmails, userId);

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

  private async handleCategoriesUpdate(
    queryRunner: QueryRunner,
    projectId: number,
    categories: any[] | undefined,
  ): Promise<void> {
    if (!categories) return;
    const categoryRepo = queryRunner.manager.getRepository(ProjectCategory);
    const existingCategories = await categoryRepo.find({ where: { project: { id: projectId } } });
    const incomingCategories = categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
    }));
    for (const cat of incomingCategories) {
      if (cat.id) {
        await categoryRepo.update({ id: cat.id, project: { id: projectId } }, { color: cat.color });
        const categoryTranslations = await queryRunner.manager.getRepository(ProjectCategoryTranslation).find({
          where: { projectCategory: { id: cat.id } },
        });
        for (const translation of categoryTranslations) {
          translation.name = cat.name;
          await queryRunner.manager.getRepository(ProjectCategoryTranslation).save(translation);
        }
      } else {
        await this.createCategoriesInTransaction(queryRunner, projectId, [cat]);
      }
    }
    const incomingIds = new Set(incomingCategories.filter(c => c.id).map(c => c.id));
    for (const existing of existingCategories) {
      if (!incomingIds.has(existing.id)) {
        await categoryRepo.delete({ id: existing.id });
      }
    }
  }

  private async handleStatusesUpdate(
    queryRunner: QueryRunner,
    projectId: number,
    statuses: any[] | undefined,
  ): Promise<void> {
    if (!statuses) return;
    const statusRepo = queryRunner.manager.getRepository(ProjectStatus);
    const existingStatuses = await statusRepo.find({ where: { project: { id: projectId } } });
    const incomingStatuses = statuses.map((status: any) => ({
      id: status.id,
      name: status.name,
      color: status.color,
    }));
    for (const status of incomingStatuses) {
      if (status.id) {
        await statusRepo.update({ id: status.id, project: { id: projectId } }, { color: status.color });
        const statusTranslations = await queryRunner.manager.getRepository(ProjectStatusTranslation).find({
          where: { projectStatus: { id: status.id } },
        });
        for (const translation of statusTranslations) {
          translation.name = status.name;
          await queryRunner.manager.getRepository(ProjectStatusTranslation).save(translation);
        }
      } else {
        await this.createStatusesInTransaction(queryRunner, projectId, [status]);
      }
    }
    const incomingIds = new Set(incomingStatuses.filter(s => s.id).map(s => s.id));
    for (const existing of existingStatuses) {
      if (!incomingIds.has(existing.id)) {
        await statusRepo.delete({ id: existing.id });
      }
    }
  }

  private async handleUsersUpdate(
    queryRunner: QueryRunner,
    projectId: number,
    usersWithRoles: any[] | undefined,
    userEmails: any[] | undefined,
    userId: number,
  ): Promise<void> {
    if (usersWithRoles && usersWithRoles.length > 0) {
      await this.validateUsersExist(usersWithRoles.map(u => u.email));
      await this.updateProjectUsersWithRoles(queryRunner, projectId, usersWithRoles, userId);
    } else if (userEmails && userEmails.length > 0) {
      await this.validateUsersExist(userEmails);
      await this.inviteUsersToProject(queryRunner, projectId, userEmails, userId);
    }
  }

  public async remove(id: number): Promise<void> {
    const userId = this.cls.get('user').userId;

    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new Error(this.i18n.t('messages.Projects.errors.projectNotFound'));
    }
    await this.checkProjectManagementPermission(id, userId);

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
    categories: Array<{ name: string; color?: string }>,
  ): Promise<void> {
    for (const categoryData of categories) {
      const category = queryRunner.manager.getRepository(ProjectCategory).create({
        color: categoryData.color || '#' + Math.floor(Math.random() * 16777215).toString(16),
        project: { id: projectId },
      });

      const savedCategory = await queryRunner.manager.getRepository(ProjectCategory).save(category);
      const languages = await queryRunner.manager.getRepository(Language).find();

      for (const language of languages) {
        const translation = queryRunner.manager.getRepository(ProjectCategoryTranslation).create({
          name: categoryData.name,
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
    statuses: Array<{ name: string; color?: string }>,
  ): Promise<void> {
    for (const statusData of statuses) {
      const status = queryRunner.manager.getRepository(ProjectStatus).create({
        color: statusData.color || '#' + Math.floor(Math.random() * 16777215).toString(16),
        project: { id: projectId },
      });

      const savedStatus = await queryRunner.manager.getRepository(ProjectStatus).save(status);

      const languages = await queryRunner.manager.getRepository(Language).find();

      for (const language of languages) {
        const translation = queryRunner.manager.getRepository(ProjectStatusTranslation).create({
          name: statusData.name,
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
    usersWithRoles: { email: string; role: number }[],
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
            relations: ['user', 'project', 'role', 'inviter'],
          });
          if (existingInvitation) {
            const newRole = await queryRunner.manager.getRepository(ProjectRole).findOne({
              where: { id: userWithRole.role },
            });
            if (newRole) {
              existingInvitation.role = newRole;
            }
            existingInvitation.inviter = inviter;
            existingInvitation.dateUpdated = new Date();
            await queryRunner.manager.getRepository(ProjectInvitation).save(existingInvitation);
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
                invitationId: existingInvitation.id,
                invitationStatus: existingInvitation.status,
                invitationDateUpdated: existingInvitation.dateUpdated,
              },
              sendEmail: true,
            });
            continue;
          }
          const invitation = queryRunner.manager.getRepository(ProjectInvitation).create({
            project: { id: projectId },
            user: { id: user.id },
            inviter: { id: inviterId },
            role: { id: userWithRole.role },
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
            data: {
              projectId,
              projectName,
              inviterEmail: inviter.email,
              role: userWithRole.role,
              invitationId: invitation.id,
              invitationStatus: invitation.status,
            },
            sendEmail: true,
          });
        }
      } catch (error) {
        console.error(`Error inviting user ${userWithRole.email}:`, error);
      }
    }
  }

  private async updateProjectUsersWithRoles(
    queryRunner: QueryRunner,
    projectId: number,
    usersWithRoles: { email: string; role: number }[],
    updaterId: number,
  ): Promise<void> {
    const updater = await this.usersService.findOne(updaterId);
    if (!updater) {
      throw new Error(this.i18n.t('messages.Projects.errors.updaterNotFound'));
    }

    const currentProjectUsers = await queryRunner.manager.getRepository(ProjectUserRole).find({
      where: { project: { id: projectId } },
      relations: ['user', 'projectRole'],
    });

    const newUserEmails = new Set(usersWithRoles.map(u => u.email));

    this.validateUpdaterInNewUsers(updater.email, newUserEmails);
    await this.removeUsersNotInList(queryRunner, currentProjectUsers, newUserEmails, updaterId);
    await this.updateOrAddUsers(queryRunner, projectId, usersWithRoles, currentProjectUsers, updaterId);
  }

  private validateUpdaterInNewUsers(updaterEmail: string, newUserEmails: Set<string>): void {
    if (!newUserEmails.has(updaterEmail)) {
      throw new Error(this.i18n.t('messages.Projects.errors.updaterNotInNewUsersList'));
    }
  }

  private async removeUsersNotInList(
    queryRunner: QueryRunner,
    currentProjectUsers: ProjectUserRole[],
    newUserEmails: Set<string>,
    updaterId: number,
  ): Promise<void> {
    for (const currentUser of currentProjectUsers) {
      if (!newUserEmails.has(currentUser.user.email)) {
        if (currentUser.user.id === updaterId) {
          throw new Error(this.i18n.t('messages.Projects.errors.cannotRemoveYourselfFromProject'));
        }
        const isManager =
          currentUser.projectRole &&
          currentUser.projectRole.id === (await this.projectRoleService.findOneByCode(ProjectRoleEnum.MANAGER))?.id;
        if (isManager) {
          const managersLeft = currentProjectUsers.filter(
            u => u.projectRole?.id === currentUser.projectRole.id && newUserEmails.has(u.user.email),
          ).length;
          if (managersLeft === 0) {
            throw new Error(this.i18n.t('messages.Projects.errors.lastManagerCannotBeRemoved'));
          }
        }
        await queryRunner.manager.getRepository(ProjectUserRole).remove(currentUser);
      }
    }
  }

  private async updateOrAddUsers(
    queryRunner: QueryRunner,
    projectId: number,
    usersWithRoles: { email: string; role: number }[],
    currentProjectUsers: ProjectUserRole[],
    updaterId: number,
  ): Promise<void> {
    const newUsersToInvite: { email: string; role: number }[] = [];
    for (const userWithRole of usersWithRoles) {
      try {
        const user = await this.usersService.findByEmail(userWithRole.email);
        if (user) {
          const existingUserRole = currentProjectUsers.find(cu => cu.user.email === userWithRole.email);
          if (existingUserRole) {
            if (existingUserRole.projectRole.id !== userWithRole.role) {
              existingUserRole.projectRole = { id: userWithRole.role } as any;
              await queryRunner.manager.getRepository(ProjectUserRole).save(existingUserRole);
            }
          } else {
            newUsersToInvite.push({ email: userWithRole.email, role: userWithRole.role });
          }
        }
      } catch (error) {
        console.error(`Error updating user ${userWithRole.email}:`, error);
      }
    }
    if (newUsersToInvite.length > 0) {
      await this.inviteUsersToProjectWithRoles(queryRunner, projectId, newUsersToInvite, updaterId);
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
      .select(['pur.id', 'user.id', 'user.email'])
      .getMany();

    return projectUsers.map(pur => ({
      id: pur.user.id,
      name: pur.user.email,
    }));
  }

  private async checkProjectManagementPermission(projectId: number, userId: number): Promise<void> {
    const userRole = await this.dataSource.getRepository(ProjectUserRole).findOne({
      where: {
        project: { id: projectId },
        user: { id: userId },
      },
      relations: ['projectRole', 'projectRole.permissions'],
    });
    const permissions = userRole?.projectRole?.permissions?.map(p => p.code) ?? [];
    if (
      !permissions.includes(ProjectRolePermissionEnum.EDIT_PROJECT) &&
      !permissions.includes(ProjectRolePermissionEnum.DELETE_PROJECT)
    ) {
      throw new Error(this.i18n.t('messages.Projects.errors.accessDeniedToManageProject'));
    }
  }

  public async acceptInvitation(invitationId: number): Promise<void> {
    const userId = this.cls.get('user').userId;
    const invitation = await this.projectInvitationRepository.findOne({
      where: { id: invitationId },
      relations: ['user', 'project', 'role'],
    });
    if (invitation?.status !== ProjectInvitationStatusEnum.PENDING) {
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

      await this.updateInvitationNotificationsStatus(invitationId, ProjectInvitationStatusEnum.ACCEPTED, manager);
    });
  }

  public async rejectInvitation(invitationId: number): Promise<void> {
    const userId = this.cls.get('user').userId;
    const invitation = await this.projectInvitationRepository.findOne({
      where: { id: invitationId },
      relations: ['user'],
    });
    if (invitation?.status !== ProjectInvitationStatusEnum.PENDING) {
      throw new Error(this.i18n.t('messages.Projects.errors.invitationNotFoundOrAlreadyHandled'));
    }
    if (invitation.user.id !== userId) {
      throw new Error(this.i18n.t('messages.Projects.errors.notAllowedToRejectInvitation'));
    }
    invitation.status = ProjectInvitationStatusEnum.REJECTED;
    await this.projectInvitationRepository.save(invitation);

    await this.updateInvitationNotificationsStatus(invitationId, ProjectInvitationStatusEnum.REJECTED);
  }

  private async validateUsersExist(emails: string[]): Promise<void> {
    const notExistingUsers: string[] = [];
    for (const email of emails) {
      const isUserExisting = await this.usersService.findByEmail(email);
      if (!isUserExisting) {
        notExistingUsers.push(email);
      }
    }
    if (notExistingUsers.length > 0) {
      throw new Error(
        this.i18n.t('messages.Projects.errors.usersNotFound', { args: { emails: notExistingUsers.join(', ') } }),
      );
    }
  }

  private async updateInvitationNotificationsStatus(
    invitationId: number,
    status: ProjectInvitationStatusEnum,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(Notification) : this.notificationRepository;
    const notifications = await repo.find({ where: { type: NotificationTypeEnum.PROJECT_INVITATION } });
    for (const notification of notifications) {
      if (notification.data?.invitationId === invitationId) {
        notification.data.invitationStatus = status;
        await repo.save(notification);
      }
    }
  }

  private mapProjectToListResponseDto(project: Project, userRole?: ProjectUserRole): ProjectListResponseDto {
    const mapTranslations = (translations: any[]): TranslationDto[] => {
      if (!translations) return [];
      return translations.map(t => ({
        lang: t.language?.code || t.lang || '',
        name: t.name,
        description: t.description ?? undefined,
      }));
    };

    let type: { id: number; code: string; translations: TranslationDto[] } | undefined = undefined;
    const typeObj = project.type || userRole?.project?.type;
    if (typeObj && Array.isArray(typeObj.translations)) {
      type = {
        id: typeObj.id,
        code: String(typeObj.code),
        translations: mapTranslations(typeObj.translations),
      };
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      isPublic: project.isPublic,
      icon: project.icon ? { url: project.icon.url } : null,
      isActive: project.isActive,
      dateCreation: project.dateCreation,
      dateModification: project.dateModification,
      type,
      permissions: userRole?.projectRole?.permissions.map(p => p.code) ?? [],
    };
  }

  private mapProjectToDetailsResponseDto(project: Project, userRole?: ProjectUserRole): ProjectDetailsResponseDto {
    const mapTranslations = (translations: any[]): TranslationDto[] => {
      if (!translations) return [];
      return translations.map(t => ({
        lang: t.language?.code || '',
        name: t.name,
        description: t.description ?? undefined,
      }));
    };

    let permissions: string[] = [];
    if (userRole?.projectRole?.permissions) {
      permissions = userRole.projectRole.permissions.map(p => p.code);
    }

    const categories = Array.isArray(project.categories)
      ? project.categories.map(cat => ({
          id: cat.id,
          name: (cat as any).name ?? cat.translations?.[0]?.name ?? '',
          color: cat.color,
        }))
      : [];

    const statuses = Array.isArray(project.statuses)
      ? project.statuses.map(status => ({
          id: status.id,
          name: (status as any).name ?? status.translations?.[0]?.name ?? '',
          color: status.color,
        }))
      : [];

    const projectUserRoles = Array.isArray(project.projectUserRoles)
      ? project.projectUserRoles.map(userRole => {
          const role = userRole.projectRole;
          return {
            user: {
              id: userRole.user.id,
              email: userRole.user.email,
            },
            projectRole: {
              id: role.id,
              code: role.code,
              translations: Array.isArray(role.translations)
                ? role.translations.map(t => ({
                    lang: t.language?.code || '',
                    name: t.name,
                    description: t.description ?? undefined,
                  }))
                : [],
            },
          };
        })
      : [];

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      isPublic: project.isPublic,
      icon: project.icon ? { url: project.icon.url } : null,
      isActive: project.isActive,
      dateCreation: project.dateCreation,
      dateModification: project.dateModification,
      type:
        project.type && Array.isArray(project.type.translations)
          ? {
              id: project.type.id,
              code: String(project.type.code),
              translations: mapTranslations(project.type.translations),
            }
          : undefined,
      categories,
      statuses,
      permissions,
      projectUserRoles,
    };
  }
}
