import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './controllers/tasks.controller';
import { PriorityTranslation } from './entities/priority-translation.entity';
import { Priority } from './entities/priority.entity';
import { TaskAttachment } from './entities/task-attachment.entity';
import { TaskCommentAttachment } from './entities/task-comment-attachment.entity';
import { TaskComment } from './entities/task-comment.entity';
import { Task } from './entities/task.entity';
import { TaskRepository } from './repositories/task.repository';
import { TasksService } from './services/tasks.service';
import { ITasksServiceToken } from './tokens/tasks-service.token';

@Module({
  imports: [TypeOrmModule.forFeature([
    Task,
    Priority,
    PriorityTranslation,
    TaskComment,
    TaskAttachment,
    TaskCommentAttachment,
  ])],
  controllers: [TasksController],
  providers: [
    TasksService,
    TaskRepository,
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
