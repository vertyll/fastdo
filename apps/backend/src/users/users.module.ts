import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { File } from '../core/file/entities/file.entity';
import { FileModule } from '../core/file/file.module';
import { MailModule } from '../core/mail/mail.module';
import { UserEmailHistory } from './entities/user-email-history.entity';
import { UserRole } from './entities/user-role.entity';
import { User } from './entities/user.entity';
import { UserEmailHistoryRepository } from './repositories/user-email-history.repository';
import { UserRoleRepository } from './repositories/user-role.repository';
import { UserRepository } from './repositories/user.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, UserEmailHistory, File]),
    MailModule,
    FileModule,
    forwardRef(() => AuthModule),
  ],
  providers: [
    UsersService,
    UserRepository,
    UserRoleRepository,
    UserEmailHistoryRepository,
  ],
  exports: [
    UsersService,
    UserRepository,
    UserRoleRepository,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
