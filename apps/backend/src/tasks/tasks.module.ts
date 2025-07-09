import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './controllers/tasks.controller';
import { TaskPriorityTranslation } from './entities/task-priority-translation.entity';
import { TaskAttachment } from './entities/task-attachment.entity';
import { TaskCommentAttachment } from './entities/task-comment-attachment.entity';
import { TaskComment } from './entities/task-comment.entity';
import { Task } from './entities/task.entity';
import { TaskRepository } from './repositories/task.repository';
import { TasksService } from './services/tasks.service';
import { ITasksServiceToken } from './tokens/tasks-service.token';
import { TaskPriorityRepository } from './repositories/task-priority.repository';
import { TaskPriorityService } from './services/task-priority.service';
import { TaskPriorityController } from './controllers/task-priority.controller';
import { TaskPriority } from './entities/task-priority.entity';
import { Language } from 'src/core/language/entities/language.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Task,
    TaskPriority,
    TaskPriorityTranslation,
    TaskComment,
    TaskAttachment,
    TaskCommentAttachment,
    Language,
  ])],
  controllers: [TasksController, TaskPriorityController],
  providers: [
    TasksService,
    TaskPriorityService,
    TaskRepository,
    TaskPriorityRepository,
    {
      provide: ITasksServiceToken,
      useClass: TasksService,
    },
  ],
  exports: [
    ITasksServiceToken,
  ],
})
export class TasksModule {
}
