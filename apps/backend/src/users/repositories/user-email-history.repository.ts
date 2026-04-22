import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEmailHistory } from '../entities/user-email-history.entity';

@Injectable()
export class UserEmailHistoryRepository extends Repository<UserEmailHistory> {
  constructor(dataSource: DataSource) {
    super(UserEmailHistory, dataSource.createEntityManager());
  }
}
