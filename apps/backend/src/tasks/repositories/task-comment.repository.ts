import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TaskComment } from '../entities/task-comment.entity';

@Injectable()
export class TaskCommentRepository extends Repository<TaskComment> {
  constructor(private readonly dataSource: DataSource) {
    super(TaskComment, dataSource.createEntityManager());
  }
}
