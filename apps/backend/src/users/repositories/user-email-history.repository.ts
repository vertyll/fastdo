import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEmailHistory } from '../entities/user-email-history.entity';

@Injectable()
export class UserEmailHistoryRepository extends Repository<UserEmailHistory> {
  constructor(private dataSource: DataSource) {
    super(UserEmailHistory, dataSource.createEntityManager());
  }
}
