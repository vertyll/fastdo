/* eslint-disable */
export default async () => {
  const t = {
    ['./tasks/entities/task.entity']: await import('./tasks/entities/task.entity'),
    ['./projects/entities/project.entity']: await import('./projects/entities/project.entity'),
  };
  return {
    '@nestjs/swagger': {
      'models': [[import('./projects/entities/project.entity'), {
        'Project': {
          id: {
            required: true,
            type: () => Number,
          },
          name: { required: true, type: () => String },
          createdAt: { required: true, type: () => Date },
          updatedAt: { required: true, type: () => Date },
          tasks: { required: true, type: () => [t['./tasks/entities/task.entity'].Task] },
        },
      }], [import('./tasks/entities/task.entity'), {
        'Task': {
          id: { required: true, type: () => Number },
          name: { required: true, type: () => String },
          done: { required: true, type: () => Boolean },
          urgent: { required: true, type: () => Boolean },
          createdAt: { required: true, type: () => Date },
          updatedAt: { required: true, type: () => Date },
          project: { required: true, type: () => t['./projects/entities/project.entity'].Project },
        },
      }], [import('./tasks/dto/create-task.dto'), {
        'CreateTaskDto': {
          name: {
            required: true,
            type: () => String,
          },
          done: { required: false, type: () => Boolean },
          urgent: { required: false, type: () => Boolean },
          projectId: { required: false, type: () => Number },
        },
      }], [import('./tasks/dto/update-task.dto'), {
        'UpdateTaskDto': {
          name: {
            required: false,
            type: () => String,
          },
          done: { required: false, type: () => Boolean },
          urgent: { required: false, type: () => Boolean },
          projectId: { required: false, type: () => Number },
        },
      }], [import('./tasks/dto/get-all-tasks-search-params.dto'), {
        'GetAllTasksSearchParams': {
          q: { required: false, type: () => String },
          sortBy: { required: false, type: () => String },
          orderBy: { required: false, type: () => Object },
          done_like: { required: false, type: () => Object },
          urgent_like: { required: false, type: () => Object },
          createdFrom: { required: false, type: () => String },
          createdTo: { required: false, type: () => String },
          updatedFrom: { required: false, type: () => String },
          updatedTo: { required: false, type: () => String },
        },
      }], [import('./projects/dto/create-project.dto'), {
        'CreateProjectDto': { name: { required: true, type: () => String } },
      }], [import('./projects/dto/get-all-projects-search-params.dto'), {
        'GetAllProjectsSearchParams': {
          q: { required: false, type: () => String },
          sortBy: { required: false, type: () => String },
          orderBy: { required: false, type: () => Object },
          createdFrom: { required: false, type: () => String },
          createdTo: { required: false, type: () => String },
          updatedFrom: { required: false, type: () => String },
          updatedTo: { required: false, type: () => String },
          status: { required: false, type: () => Object },
        },
      }], [import('./projects/dto/update-project.dto'), {
        'UpdateProjectDto': { name: { required: false, type: () => String } },
      }], [import('./common/dto/pagination-query.dto'), {
        'PaginationQueryDto': {
          limit: {
            required: true,
            type: () => Number,
            minimum: 1,
          },
          offset: { required: true, type: () => Number, minimum: 1 },
        },
      }], [import('./events/entities/event.entity'), {
        'Event': {
          id: {
            required: true,
            type: () => Number,
          },
          type: { required: true, type: () => String },
          name: { required: true, type: () => String },
          payload: { required: true, type: () => Object },
        },
      }]],
      'controllers': [[import('./app.controller'), { 'AppController': { 'getHello': { type: String } } }], [
        import('./tasks/tasks.controller'),
        {
          'TasksController': {
            'create': { type: t['./tasks/entities/task.entity'].Task },
            'findAll': { type: [t['./tasks/entities/task.entity'].Task] },
            'findAllByProjectId': { type: [t['./tasks/entities/task.entity'].Task] },
            'findOne': { type: t['./tasks/entities/task.entity'].Task },
            'update': { type: t['./tasks/entities/task.entity'].Task },
            'remove': {},
          },
        },
      ], [import('./projects/projects.controller'), {
        'ProjectsController': {
          'getAll': { type: [t['./projects/entities/project.entity'].Project] },
          'create': { type: t['./projects/entities/project.entity'].Project },
          'findOne': { type: t['./projects/entities/project.entity'].Project },
          'updateProject': { type: t['./projects/entities/project.entity'].Project },
          'remove': {},
          'update': { type: t['./projects/entities/project.entity'].Project },
        },
      }]],
    },
  };
};
