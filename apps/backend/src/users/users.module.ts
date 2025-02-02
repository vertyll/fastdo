import {forwardRef, Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './entities/user-role.entity';
import { User } from './entities/user.entity';
import { UserRoleRepository } from './repositories/user-role.repository';
import { UserRepository } from './repositories/user.repository';
import { UsersService } from './users.service';
import { UsersController } from "./users.controller";
import { MailModule } from '../core/mail/mail.module';
import { FileModule } from '../core/file/file.module';
import {UserEmailHistory} from "./entities/user-email-history.entity";
import {UserEmailHistoryRepository} from "./repositories/user-email-history.repository";
import {File} from "../core/file/entities/file.entity";
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, UserEmailHistory, File]),
    MailModule,
    FileModule,
    forwardRef(() => AuthModule)
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