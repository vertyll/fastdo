import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from '../../../../common/decorators/seeder.decorator';
import { ProjectRolePermissionTranslation } from '../../../../projects/entities/project-role-permission-translation.entity';
import { ProjectRolePermission } from '../../../../projects/entities/project-role-permission.entity';
import { ProjectRolePermissionEnum } from '../../../../projects/enums/project-role-permission.enum';
import { EnvironmentEnum } from '../../../config/types/app.config.type';
import { Language } from '../../../language/entities/language.entity';
import { LanguageCodeEnum } from '../../../language/enums/language-code.enum';
import { ISeeder } from '../interfaces/seeder.interface';
import { BaseSeederService } from '../services/base-seeder.service';
import { SeederFactoryService } from '../services/seeder-factory.service';

@Injectable()
@Seeder({
  environment: [EnvironmentEnum.DEVELOPMENT, EnvironmentEnum.PRODUCTION],
})
export class ProjectRolePermissionSeeder implements ISeeder {
  private readonly baseSeeder: BaseSeederService;

  constructor(
    @InjectRepository(ProjectRolePermission) private readonly permissionRepository: Repository<ProjectRolePermission>,
    @InjectRepository(ProjectRolePermissionTranslation)
    private readonly permissionTranslationRepository: Repository<ProjectRolePermissionTranslation>,
    @InjectRepository(Language) private readonly languageRepository: Repository<Language>,
    private readonly seederFactory: SeederFactoryService,
  ) {
    this.baseSeeder = this.seederFactory.createSeederService(ProjectRolePermissionSeeder.name);
  }

  async seed(): Promise<void> {
    await this.baseSeeder.execute(async (): Promise<void> => {
      const existingPermissions = await this.permissionRepository.find();
      if (existingPermissions.length > 0) {
        this.baseSeeder.getLogger().log('Project role permissions already exist, skipping seeding');
        return;
      }

      const languages = await this.languageRepository.find();
      if (languages.length === 0) {
        this.baseSeeder.getLogger().error('No languages found. Please run language seeder first.');
        return;
      }

      const polishLang = languages.find(lang => lang.code === LanguageCodeEnum.POLISH);
      const englishLang = languages.find(lang => lang.code === LanguageCodeEnum.ENGLISH);

      const permissionsData = [
        {
          code: ProjectRolePermissionEnum.EDIT_PROJECT,
          translations: [
            { language: polishLang, name: 'Edycja projektu', description: 'Może edytować projekt' },
            { language: englishLang, name: 'Edit project', description: 'Can edit the project' },
          ],
        },
        {
          code: ProjectRolePermissionEnum.DELETE_PROJECT,
          translations: [
            { language: polishLang, name: 'Usuwanie projektu', description: 'Może usuwać projekt' },
            { language: englishLang, name: 'Delete project', description: 'Can delete the project' },
          ],
        },
        {
          code: ProjectRolePermissionEnum.SHOW_TASKS,
          translations: [
            { language: polishLang, name: 'Podgląd zadań', description: 'Może przeglądać zadania' },
            { language: englishLang, name: 'Show tasks', description: 'Can view tasks' },
          ],
        },
        {
          code: ProjectRolePermissionEnum.INVITE_USERS,
          translations: [
            {
              language: polishLang,
              name: 'Zapraszanie użytkowników',
              description: 'Może zapraszać użytkowników do projektu',
            },
            { language: englishLang, name: 'Invite users', description: 'Can invite users to the project' },
          ],
        },
        {
          code: ProjectRolePermissionEnum.MANAGE_MEMBERS,
          translations: [
            { language: polishLang, name: 'Zarządzanie członkami', description: 'Może zarządzać członkami projektu' },
            { language: englishLang, name: 'Manage members', description: 'Can manage project members' },
          ],
        },
        {
          code: ProjectRolePermissionEnum.VIEW_PROJECT,
          translations: [
            { language: polishLang, name: 'Podgląd projektu', description: 'Może przeglądać projekt' },
            { language: englishLang, name: 'View project', description: 'Can view the project' },
          ],
        },
        {
          code: ProjectRolePermissionEnum.MANAGE_TASKS,
          translations: [
            {
              language: polishLang,
              name: 'Zarządzanie zadaniami',
              description: 'Może zarządzać wszystkimi zadaniami projektu',
            },
            { language: englishLang, name: 'Manage tasks', description: 'Can manage all project tasks' },
          ],
        },
      ];

      for (const permData of permissionsData) {
        const permission = this.permissionRepository.create({
          code: permData.code,
          isActive: true,
        });
        const savedPermission = await this.permissionRepository.save(permission);

        for (const translationData of permData.translations) {
          if (translationData.language) {
            const translation = this.permissionTranslationRepository.create({
              permission: savedPermission,
              language: translationData.language,
              name: translationData.name,
              description: translationData.description,
            });
            await this.permissionTranslationRepository.save(translation);
          }
        }
        this.baseSeeder.getLogger().log(`Created project role permission: ${permData.code}`);
      }
      this.baseSeeder.getLogger().log('Project role permissions seeding completed');
    });
  }
}
