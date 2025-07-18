import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TaskPriority } from '../entities/task-priority.entity';

@Injectable()
export class TaskPriorityRepository extends Repository<TaskPriority> {
  constructor(private readonly dataSource: DataSource) {
    super(TaskPriority, dataSource.createEntityManager());
  }
}
