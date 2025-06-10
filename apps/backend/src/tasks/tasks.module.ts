import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Priority } from './entities/priority.entity';
import { Task } from './entities/task.entity';
import { TaskRepository } from './repositories/task.repository';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ITasksServiceToken } from './tokens/tasks-service.token';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Priority])],
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
