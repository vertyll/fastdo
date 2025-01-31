/* eslint-disable */
export default async () => {
  const t = {
    ['./users/entities/user-role.entity']: await import('./users/entities/user-role.entity'),
    ['./users/entities/user.entity']: await import('./users/entities/user.entity'),
    ['./roles/entities/role.entity']: await import('./roles/entities/role.entity'),
    ['./terms-and-policies/entities/terms-section.entity']: await import(
      './terms-and-policies/entities/terms-section.entity'
    ),
    ['./terms-and-policies/enums/legal-section-type.enum']: await import(
      './terms-and-policies/enums/legal-section-type.enum'
    ),
    ['./terms-and-policies/entities/terms.entity']: await import('./terms-and-policies/entities/terms.entity'),
    ['./terms-and-policies/entities/terms-section-translation.entity']: await import(
      './terms-and-policies/entities/terms-section-translation.entity'
    ),
    ['./terms-and-policies/entities/privacy-policy-section.entity']: await import(
      './terms-and-policies/entities/privacy-policy-section.entity'
    ),
    ['./terms-and-policies/entities/privacy-policy.entity']: await import(
      './terms-and-policies/entities/privacy-policy.entity'
    ),
    ['./terms-and-policies/entities/privacy-policy-section-translation.entity']: await import(
      './terms-and-policies/entities/privacy-policy-section-translation.entity'
    ),
    ['./core/config/types/app.config.type']: await import('./core/config/types/app.config.type'),
    ['./tasks/entities/task.entity']: await import('./tasks/entities/task.entity'),
    ['./projects/entities/project.entity']: await import('./projects/entities/project.entity'),
    ['./tasks/entities/priority.entity']: await import('./tasks/entities/priority.entity'),
    ['./auth/dtos/login-response.dto']: await import('./auth/dtos/login-response.dto'),
    ['./core/file/dtos/file-metadata.dto']: await import('./core/file/dtos/file-metadata.dto'),
    ['./core/file/entities/file.entity']: await import('./core/file/entities/file.entity'),
  };
  return {
    '@nestjs/swagger': {
      'models': [[import('./users/entities/user.entity'), {
        'User': {
          id: { required: true, type: () => Number },
          email: { required: true, type: () => String },
          password: { required: true, type: () => String },
          isActive: { required: true, type: () => Boolean },
          dateCreation: { required: true, type: () => Date },
          dateModification: { required: true, type: () => Date, nullable: true },
          userRoles: { required: true, type: () => [t['./users/entities/user-role.entity'].UserRole] },
          isEmailConfirmed: { required: true, type: () => Boolean },
          confirmationToken: { required: true, type: () => String, nullable: true },
          confirmationTokenExpiry: { required: true, type: () => Date, nullable: true },
          termsAccepted: { required: true, type: () => Boolean },
          privacyPolicyAccepted: { required: true, type: () => Boolean },
          dateTermsAcceptance: { required: true, type: () => Date, nullable: true },
          datePrivacyPolicyAcceptance: { required: true, type: () => Date, nullable: true },
        },
      }], [import('./users/entities/user-role.entity'), {
        'UserRole': {
          id: {
            required: true,
            type: () => Number,
          },
          user: { required: true, type: () => t['./users/entities/user.entity'].User },
          role: { required: true, type: () => t['./roles/entities/role.entity'].Role },
        },
      }], [import('./roles/entities/role.entity'), {
        'Role': {
          id: {
            required: true,
            type: () => Number,
          },
          name: { required: true, type: () => String },
          userRoles: { required: true, type: () => [t['./users/entities/user-role.entity'].UserRole] },
        },
      }], [import('./terms-and-policies/entities/terms-section-translation.entity'), {
        'TermsSectionTranslation': {
          id: { required: true, type: () => Number },
          languageCode: { required: true, type: () => String },
          title: { required: true, type: () => String },
          content: { required: true, type: () => String },
          items: { required: true, type: () => [String] },
          section: { required: true, type: () => t['./terms-and-policies/entities/terms-section.entity'].TermsSection },
        },
      }], [import('./terms-and-policies/entities/terms-section.entity'), {
        'TermsSection': {
          id: { required: true, type: () => Number },
          order: { required: true, type: () => Number },
          type: { required: true, enum: t['./terms-and-policies/enums/legal-section-type.enum'].LegalSectionType },
          terms: { required: true, type: () => t['./terms-and-policies/entities/terms.entity'].Terms },
          translations: {
            required: true,
            type: () => [t['./terms-and-policies/entities/terms-section-translation.entity'].TermsSectionTranslation],
          },
        },
      }], [import('./terms-and-policies/entities/terms.entity'), {
        'Terms': {
          id: { required: true, type: () => Number },
          version: { required: true, type: () => String },
          dateEffective: { required: true, type: () => Date },
          dateCreation: { required: true, type: () => Date },
          dateModification: { required: true, type: () => Date, nullable: true },
          sections: {
            required: true,
            type: () => [t['./terms-and-policies/entities/terms-section.entity'].TermsSection],
          },
        },
      }], [import('./terms-and-policies/entities/privacy-policy-section-translation.entity'), {
        'PrivacyPolicySectionTranslation': {
          id: { required: true, type: () => Number },
          languageCode: { required: true, type: () => String },
          title: { required: true, type: () => String },
          content: { required: true, type: () => String },
          items: { required: true, type: () => [String] },
          section: {
            required: true,
            type: () => t['./terms-and-policies/entities/privacy-policy-section.entity'].PrivacyPolicySection,
          },
        },
      }], [import('./terms-and-policies/entities/privacy-policy-section.entity'), {
        'PrivacyPolicySection': {
          id: { required: true, type: () => Number },
          order: { required: true, type: () => Number },
          type: { required: true, enum: t['./terms-and-policies/enums/legal-section-type.enum'].LegalSectionType },
          privacyPolicy: {
            required: true,
            type: () => t['./terms-and-policies/entities/privacy-policy.entity'].PrivacyPolicy,
          },
          translations: {
            required: true,
            type: () => [
              t['./terms-and-policies/entities/privacy-policy-section-translation.entity']
                .PrivacyPolicySectionTranslation,
            ],
          },
        },
      }], [import('./terms-and-policies/entities/privacy-policy.entity'), {
        'PrivacyPolicy': {
          id: { required: true, type: () => Number },
          version: { required: true, type: () => String },
          dateEffective: { required: true, type: () => Date },
          dateCreation: { required: true, type: () => Date },
          dateModification: { required: true, type: () => Date, nullable: true },
          sections: {
            required: true,
            type: () => [t['./terms-and-policies/entities/privacy-policy-section.entity'].PrivacyPolicySection],
          },
        },
      }], [import('./auth/dtos/login-response.dto'), {
        'LoginResponseDto': { accessToken: { required: true, type: () => String } },
      }], [import('./auth/dtos/login.dto'), {
        'LoginDto': {
          email: {
            required: true,
            type: () => String,
            format: 'email',
          },
          password: { required: true, type: () => String },
        },
      }], [import('./auth/dtos/register.dto'), {
        'RegisterDto': {
          email: { required: true, type: () => String, format: 'email' },
          password: { required: true, type: () => String, minLength: 8, pattern: '/[A-Z]/' },
          termsAccepted: { required: true, type: () => Boolean },
          privacyPolicyAccepted: { required: true, type: () => Boolean },
        },
      }], [import('./core/file/entities/file.entity'), {
        'File': {
          id: { required: true, type: () => String },
          filename: { required: true, type: () => String },
          originalName: { required: true, type: () => String },
          path: { required: true, type: () => String },
          mimetype: { required: true, type: () => String },
          encoding: { required: true, type: () => String },
          size: { required: true, type: () => Number },
          storageType: {
            required: true,
            type: () => String,
            enum: t['./core/config/types/app.config.type'].StorageType,
          },
          url: { required: true, type: () => String, nullable: true },
          metadata: { required: true, type: () => Object, nullable: true },
          dateCreation: { required: true, type: () => Date },
          dateModification: { required: true, type: () => Date },
          dateDeletion: { required: true, type: () => Date, nullable: true },
        },
      }], [import('./core/file/dtos/file-metadata.dto'), {
        'FileMetadataDto': {
          id: { required: false, type: () => String },
          filename: { required: true, type: () => String },
          originalName: { required: true, type: () => String },
          path: { required: true, type: () => String },
          mimetype: { required: true, type: () => String },
          size: { required: true, type: () => Number },
          encoding: { required: true, type: () => String },
          url: { required: false, type: () => String },
          storageType: {
            required: true,
            type: () => String,
            enum: t['./core/config/types/app.config.type'].StorageType,
          },
          metadata: { required: false, type: () => Object },
        },
      }], [import('./tasks/entities/priority.entity'), {
        'Priority': { id: { required: true, type: () => Number }, name: { required: true, type: () => String } },
      }], [import('./projects/entities/project.entity'), {
        'Project': {
          id: { required: true, type: () => Number },
          name: { required: true, type: () => String },
          dateCreation: { required: true, type: () => Date },
          dateModification: { required: true, type: () => Date, nullable: true },
          tasks: { required: true, type: () => [t['./tasks/entities/task.entity'].Task] },
        },
      }], [import('./tasks/entities/task.entity'), {
        'Task': {
          id: { required: true, type: () => Number },
          name: { required: true, type: () => String },
          isDone: { required: true, type: () => Boolean },
          isUrgent: { required: true, type: () => Boolean },
          projectId: { required: true, type: () => Number, nullable: true },
          dateCreation: { required: true, type: () => Date },
          dateModification: { required: true, type: () => Date, nullable: true },
          project: { required: true, type: () => t['./projects/entities/project.entity'].Project, nullable: true },
          priority: { required: true, type: () => t['./tasks/entities/priority.entity'].Priority, nullable: true },
        },
      }], [import('./tasks/dtos/get-all-tasks-search-params.dto'), {
        'GetAllTasksSearchParams': {
          q: { required: false, type: () => String },
          sortBy: { required: false, type: () => String },
          orderBy: { required: false, type: () => Object },
          is_done: { required: false, type: () => Object },
          is_urgent: { required: false, type: () => Object },
          createdFrom: { required: false, type: () => String },
          createdTo: { required: false, type: () => String },
          updatedFrom: { required: false, type: () => String },
          updatedTo: { required: false, type: () => String },
          page: { required: false, type: () => Number },
          pageSize: { required: false, type: () => Number },
        },
      }], [import('./tasks/dtos/create-task.dto'), {
        'CreateTaskDto': {
          name: {
            required: true,
            type: () => String,
            minLength: 3,
          },
          isDone: { required: false, type: () => Boolean },
          isUrgent: { required: false, type: () => Boolean },
          projectId: { required: false, type: () => Number },
        },
      }], [import('./tasks/dtos/update-task.dto'), {
        'UpdateTaskDto': {
          name: {
            required: false,
            type: () => String,
          },
          isDone: { required: false, type: () => Boolean },
          isUrgent: { required: false, type: () => Boolean },
          projectId: { required: false, type: () => Number },
        },
      }], [import('./projects/dtos/create-project.dto'), {
        'CreateProjectDto': { name: { required: true, type: () => String, minLength: 3 } },
      }], [import('./projects/dtos/get-all-projects-search-params.dto'), {
        'GetAllProjectsSearchParams': {
          q: { required: false, type: () => String },
          sortBy: { required: false, type: () => String },
          orderBy: { required: false, type: () => Object },
          createdFrom: { required: false, type: () => String },
          createdTo: { required: false, type: () => String },
          updatedFrom: { required: false, type: () => String },
          updatedTo: { required: false, type: () => String },
          status: { required: false, type: () => Object },
          page: { required: false, type: () => Number },
          pageSize: { required: false, type: () => Number },
        },
      }], [import('./projects/dtos/update-project.dto'), {
        'UpdateProjectDto': { name: { required: false, type: () => String } },
      }], [import('./common/dtos/pagination-query.dto'), {
        'PaginationQueryDto': {
          limit: {
            required: true,
            type: () => Number,
            minimum: 1,
          },
          offset: { required: true, type: () => Number, minimum: 1 },
        },
      }]],
      'controllers': [[import('./app.controller'), { 'AppController': { 'getHello': { type: String } } }], [
        import('./auth/auth.controller'),
        {
          'AuthController': {
            'login': { type: t['./auth/dtos/login-response.dto'].LoginResponseDto },
            'register': { type: t['./users/entities/user.entity'].User },
            'confirmEmail': {},
          },
        },
      ], [import('./core/file/file.controller'), {
        'FileController': {
          'uploadFile': { type: t['./core/file/dtos/file-metadata.dto'].FileMetadataDto },
          'deleteFile': {},
          'getFile': { type: t['./core/file/entities/file.entity'].File },
        },
      }], [import('./tasks/tasks.controller'), {
        'TasksController': {
          'create': { type: t['./tasks/entities/task.entity'].Task },
          'findAll': {},
          'findAllByProjectId': {},
          'findOne': { type: t['./tasks/entities/task.entity'].Task },
          'update': { type: t['./tasks/entities/task.entity'].Task },
          'remove': {},
        },
      }], [import('./projects/projects.controller'), {
        'ProjectsController': {
          'getAll': {},
          'create': { type: t['./projects/entities/project.entity'].Project },
          'findOne': { type: t['./projects/entities/project.entity'].Project },
          'update': { type: t['./projects/entities/project.entity'].Project },
          'remove': {},
        },
      }], [import('./terms-and-policies/terms-and-policies.controller'), {
        'TermsAndPoliciesController': {
          'getTerms': { type: t['./terms-and-policies/entities/terms.entity'].Terms },
          'getPrivacyPolicy': { type: t['./terms-and-policies/entities/privacy-policy.entity'].PrivacyPolicy },
        },
      }]],
    },
  };
};
