import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Priority } from './entities/priority.entity';
import { Task } from './entities/task.entity';
import { TasksFacadeService } from './facades/tasks-facade.service';
import { TaskRepository } from './repositories/task.repository';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Priority])],
  controllers: [TasksController],
  providers: [TasksService, TasksFacadeService, TaskRepository],
  exports: [TasksFacadeService],
})
export class TasksModule {}
